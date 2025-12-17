import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { errorMiddleware } from './middleware/error';
import fingerprintRoutes from './routes/fingerprint';
import tokenRoutes from './routes/token';
import myipRoutes from './routes/myip';

const app = new Hono<Env>();

// Global middleware
app.use('*', errorMiddleware);
app.use('*', corsMiddleware);

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'creepjs-api',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

// Routes
app.route('/v1/fingerprint', fingerprintRoutes);
app.route('/v1/token', tokenRoutes);
app.route('/my-ip', myipRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;
