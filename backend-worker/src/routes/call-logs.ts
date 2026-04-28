import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { callLogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const callLogRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/call-logs
callLogRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  if (!c.env.DATABASE_URL) return c.json({ success: false, error: 'DB offline' });
  
  const db = getDb(c.env.DATABASE_URL);
  
  const logs = await db.query.callLogs.findMany({
    where: userId ? eq(callLogs.userId, userId) : undefined,
    orderBy: [desc(callLogs.createdAt)],
    limit: 50
  });
  
  return c.json({ success: true, logs });
});

export default callLogRoutes;
