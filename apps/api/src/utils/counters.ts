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
import { hashIpForLog } from './privacy';

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
 * The /64 prefix of an IPv6 address, or null if `ip` is not one this parses.
 * Expands `::` so equivalent spellings of one prefix collapse to one string.
 */
function ipv6Prefix64(ip: string): string | null {
  const address = ip.split('%')[0]!.toLowerCase();
  const halves = address.split('::');
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0) return null;

  const groups = [...head, ...Array<string>(fill).fill('0'), ...tail];
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) {
    return null;
  }
  const prefix = groups
    .slice(0, 4)
    .map((g) => Number.parseInt(g, 16).toString(16))
    .join(':');
  return `${prefix}::/64`;
}

/**
 * Who a per-visitor quota is charged to. An IPv6 host is normally assigned a
 * whole /64 and can rotate through it freely, so counting full addresses let
 * one visitor reset every per-visitor cap at will. IPv4, IPv4-mapped and
 * unparseable values count as given.
 */
export function visitorQuotaSubject(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) return mapped[1]!;
  if (!ip.includes(':')) return ip;
  return ipv6Prefix64(ip) ?? ip;
}

/** Quota counter key for the calling visitor under `prefix`. */
export async function visitorQuotaKey(
  c: Context<Env>,
  prefix: string
): Promise<string> {
  return `${prefix}:${await hashIpForLog(visitorQuotaSubject(clientIp(c)))}`;
}
