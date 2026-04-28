import { Hono } from 'hono';
import { getDb } from '../db';
import { infrastructureApiKeys, agentConfigurations, callLogs } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const externalRouter = new Hono<{ Bindings: any; Variables: { userId: string } }>();

// Middleware to validate API Key
externalRouter.use('*', async (c, next) => {
  const apiKey = c.req.header('x-api-key');
  if (!apiKey) return c.json({ error: 'Missing API Key (x-api-key)' }, 401);

  const db = getDb(c.env.DATABASE_URL);
  const keyRecord = await db.query.infrastructureApiKeys.findFirst({
    where: and(
      eq(infrastructureApiKeys.apiKey, apiKey),
      eq(infrastructureApiKeys.isActive, true)
    )
  });

  if (!keyRecord) return c.json({ error: 'Invalid or inactive API Key' }, 401);

  // Update last used
  c.executionCtx.waitUntil(
    db.update(infrastructureApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(infrastructureApiKeys.id, keyRecord.id))
  );

  c.set('userId', keyRecord.userId);
  await next();
});

// GET /agents - List workspace agents
externalRouter.get('/agents', async (c) => {
  const userId = c.get('userId');
  const db = getDb(c.env.DATABASE_URL);
  
  const agents = await db.query.agentConfigurations.findMany({
    where: eq(agentConfigurations.userId, userId)
  });

  return c.json({
    success: true,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      type: a.agentType,
      status: a.isActive ? 'online' : 'offline',
      phoneNumber: a.assignedPhoneNumber
    }))
  });
});

// POST /call - Trigger an outbound call
externalRouter.post('/call', async (c) => {
  const userId = c.get('userId');
  const { to, agentId, metadata } = await c.req.json();

  if (!to || !agentId) return c.json({ error: 'Missing to or agentId' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  const agent = await db.query.agentConfigurations.findFirst({
    where: and(
      eq(agentConfigurations.id, agentId),
      eq(agentConfigurations.userId, userId)
    )
  });

  if (!agent) return c.json({ error: 'Agent not found or unauthorized' }, 404);

  // Initiate call (triggering the internal /initiate logic)
  const url = new URL(c.req.url);
  const initiateUrl = `${url.protocol}//${url.host}/api/call/initiate`;

  try {
    const res = await fetch(initiateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toPhone: to, agentId })
    });

    const data = await res.json() as any;
    return c.json({ success: true, callSid: data.callSid, message: 'Uplink established. Agent is dialing.' });
  } catch (e: any) {
    return c.json({ error: 'Failed to initiate call', details: e.message }, 500);
  }
});

// GET /status - System pulse
externalRouter.get('/status', (c) => {
  return c.json({
    success: true,
    system: 'LaunchPixel Infrastructure',
    uplink: 'Synchronized',
    timestamp: new Date().toISOString()
  });
});
