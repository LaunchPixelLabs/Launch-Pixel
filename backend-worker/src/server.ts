import { serve } from '@hono/node-server'
import app from './index'

const port = Number(process.env.PORT) || 3000
console.log(`🚀 Server is starting on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port
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
