/**
 * Shared rolling-daily KV counters used for abuse-prevention limits.
 *
 * Read-modify-write on KV is intentionally non-atomic: these are soft
 * limits protecting cost/abuse, not billing (see the batch lookup design
 * doc). Every limiter must stay single-read/single-write per request.
 */

import type { Context } from 'hono';
import type { Env, RateLimitData } from '../types';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const DAY_TTL_SECONDS = 24 * 60 * 60;

export const intEnv = (value: string | undefined, fallback: number): number => {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function clientIp(c: Context<Env>): string {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0] ||
    '0.0.0.0'
  ).trim();
}

/**
 * Read a rolling-daily counter without incrementing.
 * Returns `{ count, resetAt }` for the active window (count 0 if expired).
 */
export async function readCounter(env: Env['Bindings'], key: string) {
  const now = Date.now();
  const data = await env.RATE_LIMIT.get<RateLimitData>(key, 'json');
  if (data && now < data.resetAt)
    return { count: data.count, resetAt: data.resetAt };
  return { count: 0, resetAt: now + DAY_MS };
}

export async function bumpCounter(
  env: Env['Bindings'],
  key: string,
  current: { count: number; resetAt: number }
) {
  await env.RATE_LIMIT.put(
    key,
    JSON.stringify({
      count: current.count + 1,
      resetAt: current.resetAt,
    } satisfies RateLimitData),
    { expirationTtl: DAY_TTL_SECONDS }
  );
}
