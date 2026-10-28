import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { Env } from '../types';
import { normalizeEmailIdentity } from '../utils/email';
import { sha256Hex } from '../utils/privacy';
import {
  DAY_MS,
  releaseQuota,
  reserveQuota,
  resetInSeconds,
} from '../utils/quota';

export interface RateLimitReservation {
  allowed: boolean;
  cost: number;
  limit: number;
  count: number;
  remaining: number;
  resetAt: number;
  resetIn: number;
  /** Counter key, so a caller that does not spend the reservation can refund it. */
  key: string;
}

/**
 * Daily allowance is keyed by the inbox that owns the token, not by the token.
 * `/v1/token` hands out tokens on request, so a per-token bucket multiplied the
 * allowance by however many tokens one requester chose to mint.
 */
export async function quotaKeyForEmail(email: string): Promise<string> {
  // Hashed so the counter name never carries an address.
  return `quota:email:${await sha256Hex(normalizeEmailIdentity(email))}`;
}

async function quotaKey(c: Context<Env>): Promise<string> {
  const email = c.get('tokenData')?.email;
  if (!email) return `quota:token:${c.get('token')}`;
  return quotaKeyForEmail(email);
}

/** Atomically consume `requestedCost` of the daily allowance. */
export async function reserveRateLimit(
  c: Context<Env>,
  requestedCost = 1
): Promise<RateLimitReservation> {
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

  const key = await quotaKey(c);
  const { allowed, count, resetAt } = await reserveQuota(c.env, key, {
    cost,
    limit,
    windowMs: DAY_MS,
  });
  const resetIn = resetInSeconds(resetAt);

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
    key,
  };
}

/** Refund a reservation whose work did not run. */
export async function refundRateLimit(
  c: Context<Env>,
  reservation: RateLimitReservation
): Promise<void> {
  await releaseQuota(c.env, reservation.key, { cost: reservation.cost });
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

  c.set('quotaUsed', reservation.count);
  c.set('quotaReservation', reservation);
  await next();
});
