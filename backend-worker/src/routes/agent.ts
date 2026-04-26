import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { deployAgent } from '../api/deploy';
import { AGENT_PRESETS } from '../agent/presets';

const agentRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/agent-configurations
agentRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  const db = getDb(c.env.DATABASE_URL);
  
  const configs = await db.query.agentConfigurations.findMany({
    where: userId ? eq(agentConfigurations.userId, userId) : undefined,
    orderBy: [desc(agentConfigurations.updatedAt)]
  });
  
  return c.json({ success: true, configurations: configs });
});

// GET /api/agent-configurations/:id
agentRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DATABASE_URL);
  
  const config = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, parseInt(id))
  });
  
  if (!config) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true, configuration: config });
});

// GET /api/agent-configurations/presets
agentRoutes.get('/presets', (c) => {
  return c.json({ success: true, presets: Object.values(AGENT_PRESETS) });
});

// POST /api/agent-configurations
agentRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    if (body.id) {
      const updated = await db.update(agentConfigurations)
        .set({
          ...body,
          updatedAt: new Date()
        })
        .where(eq(agentConfigurations.id, body.id))
        .returning();
      return c.json({ success: true, configuration: updated[0] });
    } else {
      const inserted = await db.insert(agentConfigurations)
        .values({
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return c.json({ success: true, configuration: inserted[0] });
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/agent-configurations/from-preset
agentRoutes.post('/from-preset', async (c) => {
  const { userId, presetKey } = await c.req.json();
  const db = getDb(c.env.DATABASE_URL);
  
  const preset = AGENT_PRESETS[presetKey];
  if (!preset) return c.json({ error: 'Preset not found' }, 404);
  
  try {
    const inserted = await db.insert(agentConfigurations)
      .values({
        userId,
        name: preset.name,
        role: preset.role,
        agentType: preset.agentType,
        systemPrompt: preset.systemPrompt,
        voiceId: preset.voiceId,
        firstMessage: preset.firstMessage,
        enabledTools: preset.enabledTools,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
      
    return c.json({ success: true, configuration: inserted[0] });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /api/agent-configurations/:id
agentRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DATABASE_URL);
  await db.delete(agentConfigurations).where(eq(agentConfigurations.id, parseInt(id)));
  return c.json({ success: true });
});

// Deployment route
agentRoutes.post('/:id/deploy', (c) => deployAgent(c));

export default agentRoutes;
