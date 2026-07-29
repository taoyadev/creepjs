import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { Env, RateLimitData } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RateLimitReservation {
  allowed: boolean;
  cost: number;
  limit: number;
  count: number;
  remaining: number;
  resetAt: number;
  resetIn: number;
}

/**
 * Best-effort weighted quota reservation backed by one KV read and, when
 * allowed, one KV write. KV has no compare-and-swap, so this protects the free
 * service from ordinary fan-out but is not an exact billing ledger.
 */
export async function reserveRateLimit(
  c: Context<Env>,
  requestedCost = 1
): Promise<RateLimitReservation> {
  const token = c.get('token');
  const configuredLimit = Number.parseInt(
    c.env.RATE_LIMIT_PER_DAY || '1000',
    10
  );
  const limit =
    Number.isFinite(configuredLimit) && configuredLimit > 0
      ? configuredLimit
      : 1000;
  const cost =
    Number.isSafeInteger(requestedCost) && requestedCost > 0
      ? requestedCost
      : 1;

  const rateLimitKey = `ratelimit:${token}`;
  const rateLimitData = await c.env.RATE_LIMIT.get<RateLimitData>(
    rateLimitKey,
    'json'
  );

  const now = Date.now();
  let count = 0;
  let resetAt = now + DAY_MS;

  if (rateLimitData && now < rateLimitData.resetAt) {
    count = rateLimitData.count;
    resetAt = rateLimitData.resetAt;
  }

  const resetIn = Math.max(1, Math.ceil((resetAt - now) / 1000));
  const allowed = count + cost <= limit;

  if (allowed) {
    count += cost;
    await c.env.RATE_LIMIT.put(
      rateLimitKey,
      JSON.stringify({ count, resetAt } satisfies RateLimitData),
      { expirationTtl: Math.max(60, resetIn) }
    );
  }

  c.header('X-RateLimit-Limit', limit.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, limit - count).toString());
  c.header('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());
  if (!allowed) c.header('Retry-After', resetIn.toString());

  return {
    allowed,
    cost,
    limit,
    count,
    remaining: Math.max(0, limit - count),
    resetAt,
    resetIn,
  };
}

export const rateLimitMiddleware = createMiddleware<Env>(async (c, next) => {
  const reservation = await reserveRateLimit(c, 1);
  if (!reservation.allowed) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        limit: reservation.limit,
        resetIn: reservation.resetIn,
      },
      429
    );
  }

  await next();
});
