import { getDb } from '../db';
import { apiUsage } from '../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Increment API usage for a customer.
 */
export async function incrementUsage(dbUrl: string, customerId: string, tokens: number = 0) {
  try {
    const db = getDb(dbUrl);
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Try to find existing record for this month
    const existing = await db.query.apiUsage.findFirst({
      where: and(
        eq(apiUsage.customerId, customerId),
        eq(apiUsage.month, month)
      )
    });

    if (existing) {
      await db.update(apiUsage)
        .set({
          callsCount: (existing.callsCount || 0) + 1,
          tokensUsed: (existing.tokensUsed || 0) + tokens,
          updatedAt: new Date()
        })
        .where(eq(apiUsage.id, existing.id));
    } else {
      await db.insert(apiUsage).values({
        customerId,
        month,
        callsCount: 1,
        tokensUsed: tokens,
      });
    }
  } catch (err) {
    console.error('[Usage Tracking] Failed to increment usage:', err);
    // Non-blocking: continue agent execution even if billing update fails
  }
}

