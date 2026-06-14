import { createMiddleware } from 'hono/factory';
import type { Env, RateLimitData } from '../types';

export const rateLimitMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = c.get('token');
  const limit = parseInt(c.env.RATE_LIMIT_PER_DAY || '1000', 10);

  // Get current rate limit data
  const rateLimitKey = `ratelimit:${token}`;
  const rateLimitData = await c.env.RATE_LIMIT.get<RateLimitData>(
    rateLimitKey,
    'json'
  );

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  let count = 0;
  let resetAt = now + dayInMs;

  if (rateLimitData) {
    if (now < rateLimitData.resetAt) {
      // Within current window
      count = rateLimitData.count;
      resetAt = rateLimitData.resetAt;

      if (count >= limit) {
        const resetIn = Math.ceil((resetAt - now) / 1000);
        return c.json(
          {
            error: 'Rate limit exceeded',
            limit,
            resetIn,
          },
          429
        );
      }
    }
    // Window expired, reset count
  }

  // Increment count
  count++;

  // Update rate limit data
  await c.env.RATE_LIMIT.put(
    rateLimitKey,
    JSON.stringify({ count, resetAt } satisfies RateLimitData),
    { expirationTtl: 86400 }
  );

  // Set rate limit headers
  c.header('X-RateLimit-Limit', limit.toString());
  c.header('X-RateLimit-Remaining', (limit - count).toString());
  c.header('X-RateLimit-Reset', (resetAt / 1000).toString());

  await next();
});
