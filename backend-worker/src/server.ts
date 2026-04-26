import { serve } from '@hono/node-server'
import app from './index'
import { WebSocketServer } from 'ws'
import { handleVoiceRelay } from './agent/ws-relay'
import url from 'url'

const port = Number(process.env.PORT) || 3000
console.log(`🚀 Server is starting on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const parsedUrl = url.parse(req.url || '', true);
  if (parsedUrl.pathname === '/api/call/relay') {
    const agentId = parsedUrl.query.agentId as string;
    const voiceId = parsedUrl.query.voiceId as string;
    const callSid = parsedUrl.query.callSid as string;
    
    console.log(`[WS] New connection for agent ${agentId}`);
    
    handleVoiceRelay(ws as any, process.env as any, {
      agentId: agentId || process.env.ELEVENLABS_AGENT_ID || '',
      voiceId: voiceId || 'rachel',
      callSid: callSid || 'unknown'
    });
  }
});

// Graceful Shutdown Optimization
const shutdown = () => {
  console.log('🛑 Received kill signal, shutting down gracefully...');
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
