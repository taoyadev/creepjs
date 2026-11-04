import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error';
import { requestLoggerMiddleware } from './middleware/request-logger';
import fingerprintRoutes from './routes/fingerprint';
import tokenRoutes from './routes/token';
import myipRoutes from './routes/myip';
import ipRoutes from './routes/ip';
import statsRoutes from './routes/stats';
import eventsRoutes from './routes/events';

const app = new Hono<Env>();
const API_VERSION = '1.0.0';

app.onError(errorHandler);

// Global middleware
app.use('*', requestLoggerMiddleware);
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
app.route('/v1/stats', statsRoutes);
app.route('/v1/events', eventsRoutes);
app.route('/my-ip', myipRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Durable Object classes must be exported from the Worker entry point for the
// runtime to bind them.
export { QuotaCounter } from './durable/QuotaCounter';
export { StatsCounter } from './durable/StatsCounter';

export default app;
