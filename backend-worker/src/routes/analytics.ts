import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { callLogs, agentContacts, scheduledTasks } from '../db/schema';
import { eq, and, count, sum } from 'drizzle-orm';

const analyticsRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/analytics
analyticsRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  if (!c.env.DATABASE_URL) return c.json({ success: false, error: 'DB offline' });
  
  const db = getDb(c.env.DATABASE_URL);
  
  // Basic metrics
  const totalCallsRes = await db.select({ count: count() }).from(callLogs).where(userId ? eq(callLogs.userId, userId) : undefined);
  const totalCalls = totalCallsRes[0].count;

  const connectedCallsRes = await db.select({ count: count() }).from(callLogs)
    .where(and(userId ? eq(callLogs.userId, userId) : undefined, eq(callLogs.status, 'completed')));
  const connectedCalls = connectedCallsRes[0].count;

  const interestedCallsRes = await db.select({ count: count() }).from(callLogs)
    .where(and(userId ? eq(callLogs.userId, userId) : undefined, eq(callLogs.outcome, 'interested')));
  const interestedCalls = interestedCallsRes[0].count;

  const meetingsRes = await db.select({ count: count() }).from(callLogs)
    .where(and(userId ? eq(callLogs.userId, userId) : undefined, eq(callLogs.outcome, 'meeting-booked')));
  const meetingsBooked = meetingsRes[0].count;

  const pendingTasksRes = await db.select({ count: count() }).from(scheduledTasks)
    .where(eq(scheduledTasks.status, 'pending'));
  const pendingTasks = pendingTasksRes[0].count;

  // Pipeline metrics
  const totalPipelineRes = await db.select({ sum: sum(agentContacts.leadScore) }).from(agentContacts)
    .where(userId ? eq(agentContacts.userId, userId) : undefined);
  const totalPipeline = parseInt(totalPipelineRes[0].sum as string) || 0;

  return c.json({
    success: true,
    data: {
      totalCalls,
      connectedCalls,
      interestedCalls,
      meetingsBooked,
      pendingTasks,
      totalPipeline,
      connectRate: totalCalls > 0 ? ((connectedCalls / totalCalls) * 100).toFixed(1) + '%' : '0%',
      conversionRate: connectedCalls > 0 ? (((interestedCalls + meetingsBooked) / connectedCalls) * 100).toFixed(1) + '%' : '0%'
    }
  });
});

export default analyticsRoutes;
