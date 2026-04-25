import { serve } from '@hono/node-server';
import app from './index';
import * as dotenv from 'dotenv';
import { processScheduledTasks } from './agent/scheduler';
import { waManager } from './whatsapp-adapter';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

console.log(`🚀 [Sketch Engine] Server starting on http://localhost:${port}`);

// Mock Bindings for Node environment
const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_ADMIN_KEY: process.env.ANTHROPIC_ADMIN_KEY || '',
};

// Start the scheduler loop in Node
setInterval(() => {
  processScheduledTasks(env as any).catch(err => console.error("[Scheduler Error]", err));
}, 60000); // Every minute

// Bootstrap WhatsApp
waManager.setEnv(env as any);
waManager.bootstrap().catch(err => console.error("[WhatsApp Bootstrap Error]", err));

serve({
  fetch: app.fetch,
  port: port,
});
