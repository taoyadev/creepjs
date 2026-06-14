import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { errorMiddleware } from './middleware/error';
import fingerprintRoutes from './routes/fingerprint';
import tokenRoutes from './routes/token';
import myipRoutes from './routes/myip';
import ipRoutes from './routes/ip';

const app = new Hono<Env>();
const API_VERSION = '1.0.0';

// Global middleware
app.use('*', errorMiddleware);
app.use('*', corsMiddleware);

const healthResponse = () => ({
  status: 'ok',
  service: 'creepjs-api',
  version: API_VERSION,
  time: new Date().toISOString(),
  timestamp: Date.now(),
});

// Health checks
app.get('/', (c) => {
  return c.json(healthResponse());
});

app.get('/v1/health', (c) => {
  return c.json({
    ...healthResponse(),
    route: '/v1/health',
  });
});

// Routes
app.route('/v1/fingerprint', fingerprintRoutes);
app.route('/v1/token', tokenRoutes);
app.route('/v1/ip', ipRoutes);
app.route('/my-ip', myipRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;
