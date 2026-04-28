import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import agentRoutes from './routes/agent';
import contactRoutes from './routes/contacts';
import callRoutes from './routes/calls';
import whatsappRoutes from './routes/whatsapp';
import stripeRoutes from './routes/stripe';
import analyticsRoutes from './routes/analytics';
import callLogRoutes from './routes/call-logs';
import billingRoutes from './routes/billing';
import scrapeRoutes from './routes/scrape';

import { runSketchAgent } from './agent/sketch-runner';
import { sketchTools, SketchToolName } from './agent/sketch-tools';
import { globalQueueManager } from './agent/queue';
import { getDb } from './db';
import { agentConfigurations } from './db/schema';
import { eq } from 'drizzle-orm';
import { externalRouter } from './api/external';

export type Bindings = {
  DATABASE_URL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_AGENT_ID?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_ADMIN_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_STARTER?: string;
  STRIPE_PRICE_GROWTH?: string;
  WORKER_BASE_URL?: string;
  BUSINESS_WHATSAPP_NUMBER?: string;
  SLACK_WEBHOOK_URL?: string;
  NOTION_API_KEY?: string;
  OPENAI_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Polyfill environment variables for Node.js environments (Render)
app.use('*', async (c, next) => {
  if (!c.env?.DATABASE_URL && typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    // @ts-ignore - Injecting process.env for Node compat
    c.env = process.env;
  }
  await next();
});

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // For production, replace with frontend URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${err.message}`);
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

// Health & Info
app.get('/', (c) => c.text('LaunchPixel API v5.0'));
app.get('/health', (c) => c.json({ status: 'operational', timestamp: new Date().toISOString() }));



// Modular Routes
app.route('/api/agent-configurations', agentRoutes);
app.route('/api/contacts', contactRoutes);
app.route('/api/call', callRoutes);
app.route('/api/whatsapp', whatsappRoutes);
app.route('/api/stripe', stripeRoutes);
app.route('/api/v1', externalRouter);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/call-logs', callLogRoutes);
app.route('/api/billing', billingRoutes);
app.route('/api/scrape', scrapeRoutes);
app.route('/api/knowledge-sources', scrapeRoutes);

// Quick Call / Manual Trigger
app.post('/api/call/initiate', async (c) => {
  const { toPhone, agentId, contactName } = await c.req.json();
  if (!toPhone || !agentId) return c.json({ error: 'Missing toPhone or agentId' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  const agent = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, agentId)
  });

  if (!agent) return c.json({ error: 'Agent not found' }, 404);

  const auth = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);
  const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}/Calls.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: agent.assignedPhoneNumber || c.env.TWILIO_PHONE_NUMBER,
      To: toPhone,
      Url: `${c.env.WORKER_BASE_URL || 'http://localhost:3000'}/api/call/twiml?agentId=${agentId}`
    })
  });

  const data = await twilioRes.json() as any;
  if (!twilioRes.ok) return c.json({ error: data.message || 'Twilio Failed' }, 500);

  return c.json({ success: true, callSid: data.sid });
});

// Agent Execution Endpoint
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
