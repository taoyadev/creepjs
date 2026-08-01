/**
 * Shared helpers for abuse-prevention limits.
 *
 * The rolling-daily counters that used to live here were a KV
 * read-modify-write, which a concurrent burst could pass in full. Counting now
 * goes through `utils/quota.ts`, which is atomic; what remains here is the
 * request-shape helpers those limiters need.
 */

import type { Context } from 'hono';
import type { Env } from '../types';

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
