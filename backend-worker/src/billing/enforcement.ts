import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { billingPlans, userSubscriptions } from '../db/billing-schema';
import { eq, sql, count } from 'drizzle-orm';

/**
 * Checks if a user is allowed to create or deploy another agent based on their subscription.
 * @returns {Promise<{ allowed: boolean, reason?: string }>}
 */
export async function checkAgentCreationLimit(userId: string, env: any) {
  const db = getDb(env.DATABASE_URL, true);

  try {
    // 1. Get user's active subscription
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
      with: {
        plan: true
      }
    }) as any;

    // 2. Default to Free Plan if no subscription found
    let agentLimit = 1;
    let planName = 'Free Tier';

    if (subscription && subscription.plan) {
      agentLimit = subscription.plan.agentLimit;
      planName = subscription.plan.name;
    }

    // 3. Count current agents
    const currentAgents = await db.select({ count: count() })
      .from(agentConfigurations)
      .where(eq(agentConfigurations.userId, userId));
    
    const activeCount = currentAgents[0].count || 0;

    if (activeCount >= agentLimit) {
      return { 
        allowed: false, 
        reason: `Limit reached. Your ${planName} allows up to ${agentLimit} agent(s). Please upgrade to create more.` 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('[BillingEnforcement] Error checking limit:', error);
    // Fail-safe: allow if billing system error occurs to prevent blocking legitimate users, 
    // but log it extensively. In a strict prod env, you might block.
    return { allowed: true }; 
  }
}
