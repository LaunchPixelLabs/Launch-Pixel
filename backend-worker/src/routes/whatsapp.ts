import { Hono } from 'hono';
import { Bindings } from '../index';
import { waManager } from '../whatsapp-adapter';
import { getDb } from '../db';
import { pendingDecisions } from '../db/schema';
import { eq } from 'drizzle-orm';

const whatsappRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/whatsapp/qr/:agentId — Read-only, no side effects
whatsappRoutes.get('/qr/:agentId', async (c) => {
  const { agentId } = c.req.param();
  if (!agentId) return c.json({ error: 'Missing agentId' }, 400);

  const numericAgentId = parseInt(agentId, 10);

  try {
    waManager.setEnv(c.env);
    const status = waManager.getStatus(numericAgentId);
    const qr = waManager.getQR(numericAgentId);

    return c.json({ success: true, qr, status, agentId });
  } catch (e: any) {
    console.error(`[WhatsApp QR] Failed for agent ${agentId}:`, e.message);
    return c.json({ success: false, status: 'disconnected', qr: null, error: e.message });
  }
});

// GET /api/whatsapp/status/:agentId — Read-only status check
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

/**
 * POST /api/whatsapp/connect/:agentId
 * 
 * Smart connection handler:
 * 1. Force-kills any stale session
 * 2. Clears corrupt DB credentials
 * 3. Creates fresh Baileys session
 * 4. Waits up to 8s for QR code generation
 * 5. If 401 (stale creds), auto-clears and retries once
 */
whatsappRoutes.post('/connect/:agentId', async (c) => {
  const { agentId } = c.req.param();
  const numericAgentId = parseInt(agentId, 10);

  try {
    waManager.setEnv(c.env);
    
    // Force reconnect — kills stale sessions + clears DB creds
    await waManager.reconnectAgent(numericAgentId);
    
    // Wait for QR with polling (Baileys generates QR asynchronously via WebSocket)
    let qr: string | null = null;
    let status = waManager.getStatus(numericAgentId);
    
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 1000));
      qr = waManager.getQR(numericAgentId);
      status = waManager.getStatus(numericAgentId);
      
      if (qr || status === 'connected') break;
      
      // If disconnected immediately (401 stale creds), reconnectAgent already
      // cleared the DB. Try one more init with fresh creds.
      if (status === 'disconnected' && i === 2) {
        console.log(`[WhatsApp Connect] Agent ${agentId}: detected early disconnect, retrying with fresh creds...`);
        await waManager.reconnectAgent(numericAgentId);
      }
    }
    
    return c.json({ 
      success: true, 
      message: qr ? 'QR code ready' : status === 'connected' ? 'Already connected' : 'Connection initiated — QR pending',
      qr,
      status
    });
  } catch (e: any) {
    console.error(`[WhatsApp Connect] Failed for agent ${agentId}:`, e.message);
    return c.json({ 
      success: false, 
      error: e.message || 'Failed to connect WhatsApp session' 
    }, 500);
  }
});

// POST /api/whatsapp/twilio-webhook — HITL approval via WhatsApp
whatsappRoutes.post('/twilio-webhook', async (c) => {
  const body = await c.req.parseBody();
  const incomingMessage = (body.Body as string || '').trim().toUpperCase();
  const from = body.From as string;
  
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
