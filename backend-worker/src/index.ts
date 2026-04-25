import { Hono } from 'hono';
import { cors } from 'hono/cors';

import agentRoutes from './routes/agent';
import contactRoutes from './routes/contacts';
import callRoutes from './routes/calls';
import whatsappRoutes from './routes/whatsapp';
import stripeRoutes from './routes/stripe';

import { runSketchAgent } from './agent/sketch-runner';
import { sketchTools, SketchToolName } from './agent/sketch-tools';
import { globalQueueManager } from './agent/queue';

export type Bindings = {
  DATABASE_URL: string;
  ELEVENLABS_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ELEVENLABS_AGENT_ID: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_ADMIN_KEY?: string;
  BUSINESS_WHATSAPP_NUMBER?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_STARTER?: string;
  STRIPE_PRICE_GROWTH?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// Health & Info
app.get('/', (c) => c.text('Launch-Pixel Matrix API v4.1 Active'));
app.get('/health', (c) => c.json({ status: 'operational', timestamp: new Date().toISOString() }));

// Modular Routes
app.route('/api/agent-configurations', agentRoutes);
app.route('/api/contacts', contactRoutes);
app.route('/api/call', callRoutes);
app.route('/api/whatsapp', whatsappRoutes);
app.route('/api/stripe', stripeRoutes);

// Shared Agent Execution (Sync Matrix)
app.post('/api/agent/sketch-run', async (c) => {
  const { userId, systemPrompt, message } = await c.req.json();
  if (!userId || !message) return c.json({ error: 'Missing userId or message' }, 400);

  const result = await new Promise((resolve) => {
    globalQueueManager.getQueue(userId).enqueue(async () => {
      const runResult = await runSketchAgent({
        userId,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
        userMessage: message,
        env: c.env,
      });
      resolve(runResult);
    });
  });

  return c.json({ success: true, result });
});

// ElevenLabs Tool Webhook
app.post('/api/elevenlabs/webhook', async (c) => {
  const body = await c.req.json();
  const toolName = body.tool_name as SketchToolName;
  if (sketchTools[toolName]) {
    const result = await sketchTools[toolName].execute(body.parameters || body, c.env);
    return c.json({ success: true, result });
  }
  return c.json({ error: 'Tool not found' }, 404);
});

export default app;
