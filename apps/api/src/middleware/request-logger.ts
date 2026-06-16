import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';
import { logEvent } from '../utils/logging';

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

export const requestLoggerMiddleware = createMiddleware<Env>(
  async (c, next) => {
    const requestId = crypto.randomUUID();
    const startedAt = now();

    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);

    await next();

    const latencyMs = now() - startedAt;
    const rateLimitLimit = c.res.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = c.res.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = c.res.headers.get('X-RateLimit-Reset');
    const retryAfter = c.res.headers.get('Retry-After');

    logEvent({
      msg: 'api.request',
      request_id: requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      latency_ms: Number(latencyMs.toFixed(2)),
      rate_limit_limit: rateLimitLimit ? Number(rateLimitLimit) : null,
      rate_limit_remaining: rateLimitRemaining
        ? Number(rateLimitRemaining)
        : null,
      rate_limit_reset: rateLimitReset ? Number(rateLimitReset) : null,
      retry_after: retryAfter ? Number(retryAfter) : null,
    });
  }
);
