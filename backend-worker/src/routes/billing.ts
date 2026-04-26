import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { userSubscriptions, billingPlans, billingUsageLogs } from '../db/billing-schema';
import { agentConfigurations } from '../db/schema';
import { eq, count, sum } from 'drizzle-orm';

const billingRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/billing/subscription
billingRoutes.get('/subscription', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ error: 'Missing userId' }, 400);

  const db = getDb(c.env.DATABASE_URL, true);

  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
      with: { plan: true }
    }) as any;

    const agentCountRes = await db.select({ count: count() })
      .from(agentConfigurations)
      .where(eq(agentConfigurations.userId, userId));
    
    const usage = await db.select({ 
      totalAmount: sum(billingUsageLogs.amount),
      type: billingUsageLogs.type 
    })
    .from(billingUsageLogs)
    .where(eq(billingUsageLogs.userId, userId))
    .groupBy(billingUsageLogs.type);

    const minutes = usage.find(u => u.type === 'minute')?.totalAmount || 0;
    const tokens = usage.find(u => u.type === 'token')?.totalAmount || 0;

    return c.json({
      success: true,
      subscription: subscription || { status: 'none', plan: { name: 'Free Tier', agentLimit: 1, minuteLimit: 100, tokenLimit: 100000 } },
      usage: {
        agents: agentCountRes[0].count || 0,
        minutes: Number(minutes),
        tokens: Number(tokens)
      }
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default billingRoutes;
