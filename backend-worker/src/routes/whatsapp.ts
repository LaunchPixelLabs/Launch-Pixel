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
  
  if (!agentId) return c.json({ error: 'Missing agentId' }, 400);

  const numericAgentId = parseInt(agentId, 10);

  try {
    // CRITICAL: Set env before any manager call
    waManager.setEnv(c.env);
    await waManager.initializeAgent(numericAgentId);
    const status = waManager.getStatus(numericAgentId);
    const qr = waManager.getQR(numericAgentId);

    return c.json({
      success: true,
      qr: qr,
      status: status,
      agentId
    });
  } catch (e: any) {
    console.error(`[WhatsApp QR] Failed for agent ${agentId}:`, e.message);
    return c.json({ 
      success: false, 
      status: 'disconnected', 
      qr: null, 
      error: e.message || 'Failed to initialize WhatsApp session' 
    });
  }
});

// GET /api/whatsapp/status/:agentId
whatsappRoutes.get('/status/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const numericAgentId = parseInt(agentId, 10);

  try {
    const status = waManager.getStatus(numericAgentId);
    const qr = waManager.getQR(numericAgentId);
    return c.json({ success: true, status, qr });
  } catch (e: any) {
    return c.json({ success: true, status: 'disconnected', qr: null });
  }
});

// POST /api/whatsapp/connect/:agentId
whatsappRoutes.post('/connect/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const numericAgentId = parseInt(agentId, 10);

  try {
    // CRITICAL: Set env before any manager call
    waManager.setEnv(c.env);
    await waManager.initializeAgent(numericAgentId);
    return c.json({ success: true, message: 'Connection initiated' });
  } catch (e: any) {
    console.error(`[WhatsApp Connect] Failed for agent ${agentId}:`, e.message);
    return c.json({ 
      success: false, 
      error: e.message || 'Failed to connect WhatsApp session' 
    }, 500);
  }
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

