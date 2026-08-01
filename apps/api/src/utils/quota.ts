/**
 * Client for the atomic quota counters (see durable/QuotaCounter.ts).
 *
 * Callers that meter work which may turn out not to consume budget — a cached
 * upstream lookup, a failed one, a second counter that denies after the first
 * already reserved — reserve first and `releaseQuota` the difference, so a
 * denial never leaves budget consumed.
 */

import type { Env } from '../types';
import type { QuotaRequest, QuotaResult } from '../durable/QuotaCounter';

export const DAY_MS = 24 * 60 * 60 * 1000;

async function call(
  env: Env['Bindings'],
  key: string,
  body: QuotaRequest
): Promise<QuotaResult> {
  const stub = env.QUOTA.get(env.QUOTA.idFromName(key));
  const response = await stub.fetch('https://quota.internal/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json<QuotaResult>();
}

/** Atomically consume `cost` if it fits under `limit`. */
export async function reserveQuota(
  env: Env['Bindings'],
  key: string,
  options: { cost?: number; limit: number; windowMs?: number }
): Promise<QuotaResult> {
  return call(env, key, {
    op: 'reserve',
    cost: options.cost ?? 1,
    limit: options.limit,
    windowMs: options.windowMs ?? DAY_MS,
  });
}

/** Give back a reservation that was not spent. */
export async function releaseQuota(
  env: Env['Bindings'],
  key: string,
  options: { cost?: number; windowMs?: number } = {}
): Promise<void> {
  await call(env, key, {
    op: 'release',
    cost: options.cost ?? 1,
    windowMs: options.windowMs ?? DAY_MS,
  });
}

/** Seconds until the window rolls over, floored at 1 for `Retry-After`. */
export function resetInSeconds(resetAt: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}
