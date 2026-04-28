import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentContacts } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const contactRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/contacts
contactRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  const db = getDb(c.env.DATABASE_URL);
  
  const contacts = await db.query.agentContacts.findMany({
    where: userId ? eq(agentContacts.userId, userId) : undefined,
    orderBy: [desc(agentContacts.createdAt)]
  });
  
  return c.json({ success: true, contacts });
});

// POST /api/agent-contacts
contactRoutes.post('/', async (c) => {
  const { contacts } = await c.req.json();
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const results = [];
    for (const contact of contacts) {
      const res = await db.insert(agentContacts)
        .values({
          ...contact,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [agentContacts.phoneNumber, agentContacts.userId],
          set: { updatedAt: new Date() }
        })
        .returning();
      results.push(res[0]);
    }
    return c.json({ success: true, count: results.length });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default contactRoutes;
