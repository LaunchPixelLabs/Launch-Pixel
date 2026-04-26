import { Hono } from 'hono';
import { Bindings } from '../index';
import { waManager } from '../whatsapp-adapter';
import { getDb } from '../db';
import { pendingDecisions } from '../db/schema';
import { eq } from 'drizzle-orm';

const whatsappRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/whatsapp/qr/:agentId
whatsappRoutes.get('/qr/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const userId = c.req.query('userId');
  
  if (!agentId) return c.json({ error: 'Missing agentId' }, 400);

  const numericAgentId = parseInt(agentId, 10);

  // Initialize the session if not exists
  await waManager.initializeAgent(numericAgentId);
  const status = waManager.getStatus(numericAgentId);
  const qr = waManager.getQR(numericAgentId);

  return c.json({
    success: true,
    qr: qr,
    status: status,
    agentId
  });
});

// GET /api/whatsapp/status/:agentId
whatsappRoutes.get('/status/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const numericAgentId = parseInt(agentId, 10);
  const status = waManager.getStatus(numericAgentId);
  const qr = waManager.getQR(numericAgentId);
  return c.json({ success: true, status, qr });
});

// POST /api/whatsapp/connect/:agentId
whatsappRoutes.post('/connect/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const numericAgentId = parseInt(agentId, 10);
  await waManager.initializeAgent(numericAgentId);
  return c.json({ success: true, message: 'Connection initiated' });
});

// POST /api/whatsapp/twilio-webhook
whatsappRoutes.post('/twilio-webhook', async (c) => {
  const body = await c.req.parseBody();
  const incomingMessage = (body.Body as string || '').trim().toUpperCase();
  const from = body.From as string; // 'whatsapp:+1234567890'
  
  // Parse APPROVE #12 or DENY #12
  const match = incomingMessage.match(/^(APPROVE|DENY)\s+#?(\d+)$/);
  
  if (match && c.env.DATABASE_URL) {
    const action = match[1];
    const decisionId = parseInt(match[2], 10);
    
    const db = getDb(c.env.DATABASE_URL);
    
    await db.update(pendingDecisions).set({
      status: action === 'APPROVE' ? 'approved' : 'denied',
      resolvedAt: new Date(),
      resolvedBy: from
    }).where(eq(pendingDecisions.id, decisionId));
    
    return c.text(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Decision #${decisionId} ${action === 'APPROVE' ? 'approved' : 'denied'}.</Message></Response>`, 200, { 'Content-Type': 'text/xml' });
  }

  return c.text(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, 200, { 'Content-Type': 'text/xml' });
});

export default whatsappRoutes;
