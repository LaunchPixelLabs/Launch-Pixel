import { serve } from '@hono/node-server'
import app from './index'
import { WebSocketServer } from 'ws'
import { handleVoiceRelay } from './agent/ws-relay'
import { TaskWorker } from './agent/worker'
import { getDb } from './db'
import { agentConfigurations } from './db/schema'
import { eq } from 'drizzle-orm'
import { waManager } from './whatsapp-adapter'
import url from 'url'
import dotenv from 'dotenv'

dotenv.config()

const port = Number(process.env.PORT) || 3000
console.log(`🚀 Server is starting on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port
});

// Initialize Background Worker for persistence
const worker = new TaskWorker(process.env.DATABASE_URL || '', process.env as any);
worker.start();

// Bootstrap WhatsApp Manager — sets env and auto-reconnects active sessions
waManager.setEnv(process.env as any);
waManager.bootstrap().catch(e => console.error('[WhatsApp] Bootstrap failed:', e.message));

const wss = new WebSocketServer({ server: server as any });

wss.on('connection', (ws, req) => {
  const parsedUrl = url.parse(req.url || '', true);
  if (parsedUrl.pathname === '/api/call/relay') {
    const agentId = parsedUrl.query.agentId as string;
    const voiceId = parsedUrl.query.voiceId as string;
    const callSid = parsedUrl.query.callSid as string;
    const contactPhone = parsedUrl.query.contactPhone as string;
    const configId = parsedUrl.query.configId as string;
    
    console.log(`[WS] New connection for agent ${agentId}`);
    
    (async () => {
      let agentConfig = undefined;
      if (configId && process.env.DATABASE_URL) {
        try {
          const db = getDb(process.env.DATABASE_URL);
          agentConfig = await db.query.agentConfigurations.findFirst({
            where: eq(agentConfigurations.id, parseInt(configId))
          });
        } catch(e) {
          console.error("[WS] Failed to fetch agent config", e);
        }
      }

      handleVoiceRelay(ws as any, process.env as any, {
        agentId: agentId || process.env.ELEVENLABS_AGENT_ID || '',
        voiceId: voiceId || 'rachel',
        callSid: callSid || 'unknown',
        contactPhone: contactPhone,
        agent: agentConfig
      });
    })();
  }
});

// Graceful Shutdown Optimization
const shutdown = () => {
  console.log('🛑 Received kill signal, shutting down gracefully...');
  worker.stop();
  server.close(() => {
    console.log('✅ Closed out remaining connections.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
