import { Hono } from 'hono';
import { Bindings } from '../index';
import { waManager } from '../whatsapp-adapter';

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

export default whatsappRoutes;
