/**
 * IPbot IP intelligence service.
 *
 * Wraps `GET {IPBOT_API_ORIGIN}/v1/ip/{ip}` (header `X-API-Key: {IPBOT_API_KEY}`)
 * behind a reusable `lookupIP(ip, env)` helper with:
 *   - KV-backed caching: 24h default, 1h for high-risk results
 *   - exponential backoff + Retry-After handling for HTTP 429
 *   - structured logging of the `X-RateLimit-*` response headers
 *
 * Credentials are read exclusively from the Worker environment
 * (`IPBOT_API_ORIGIN`, `IPBOT_API_KEY`) — never hardcoded.
 */

import type { Env } from '../types';

/** Subset of Worker bindings required by the IPbot service. */
export type IpbotBindings = Pick<
  Env['Bindings'],
  'IPBOT_API_ORIGIN' | 'IPBOT_API_KEY' | 'IP_CACHE'
>;

/** Raw response shape returned by `GET {origin}/v1/ip/{ip}`. */
export interface IpbotResponse {
  ip: string;
  stack?: string;
  location?: {
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    postal?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  network?: {
    asn?: string;
    org?: string;
    category?: string;
    operator?: string;
    operator_type?: string;
    service_role?: string;
    service_name?: string;
    routability?: string;
    owner?: string;
    allocation?: {
      cidr?: string;
      range?: string;
      registry?: string;
    };
  };
  routing?: {
    origin_asn?: string;
    prefix?: string;
    rpki_status?: string;
    confidence?: string;
  };
  score?: {
    ip_score?: number;
    risk_score?: number;
    band?: string;
    verdict?: string;
    recommended_action?: string;
  };
  classification?: {
    usage_type?: string;
    is_datacenter?: boolean;
    is_proxy?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    threat_level?: string;
    [key: string]: unknown;
  };
  evidence?: {
    signals?: Array<{
      category?: string;
      label?: string;
      severity?: string;
      confidence?: string;
      description?: string;
    }>;
  };
  [key: string]: unknown;
}

/** Rate-limit metadata parsed from the IPbot response headers. */
export interface IpbotRateLimit {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
  tier: string | null;
  retryAfter: number | null;
}

/** Result returned by {@link lookupIP}. */
export interface IpbotLookupResult {
  data: IpbotResponse;
  /** True when served from the KV cache (no upstream request made). */
  cached: boolean;
  /** True when the result was classified as high risk (shorter cache TTL). */
  highRisk: boolean;
  /** Rate-limit snapshot from the most recent upstream response (empty on cache hit). */
  rateLimit: IpbotRateLimit;
}

/** Error thrown for invalid input, misconfiguration, or upstream failures. */
export class IpbotError extends Error {
  readonly status?: number;
  readonly retryAfter?: number | null;

  constructor(message: string, status?: number, retryAfter?: number | null) {
    super(message);
    this.name = 'IpbotError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const DAY_SECONDS = 60 * 60 * 24; // 24h — default cache TTL
const HOUR_SECONDS = 60 * 60; // 1h — high-risk cache TTL
const CACHE_PREFIX = 'ipbot:';
const MAX_RETRIES = 3; // total upstream attempts = MAX_RETRIES + 1
const MAX_BACKOFF_MS = 4000; // cap a single backoff (Workers wall-clock budget)
const HIGH_RISK_SCORE = 50; // risk_score >= this => high risk

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

interface CachedEntry {
  data: IpbotResponse;
  highRisk: boolean;
  rateLimit: IpbotRateLimit;
  cachedAt: number;
}

const emptyRateLimit = (): IpbotRateLimit => ({
  limit: null,
  remaining: null,
  reset: null,
  tier: null,
  retryAfter: null,
});

/** Validate an IPv4 or IPv6 literal (defends the upstream path against injection). */
export function isValidIp(ip: string): boolean {
  if (typeof ip !== 'string' || ip.length === 0 || ip.length > 45) return false;
  if (IPV4_RE.test(ip)) return true;
  // Pragmatic IPv6 check: hex groups + optional `::` compression, optional zone id.
  const addr = ip.split('%')[0] ?? ip;
  if (!/^[0-9a-fA-F:]+$/.test(addr)) return false;
  if (!addr.includes(':')) return false;
  if ((addr.match(/::/g)?.length ?? 0) > 1) return false; // at most one `::`
  const groups = addr.split(':');
  if (groups.length > 8) return false;
  return groups.every((g) => g === '' || /^[0-9a-fA-F]{1,4}$/.test(g));
}

/**
 * Classify a result as high risk. High-risk results are cached for 1h instead
 * of 24h so a flagged IP re-clears quickly once upstream intelligence changes.
 */
export function isHighRisk(data: IpbotResponse): boolean {
  const score = data.score ?? {};
  const cls = data.classification ?? {};

  if (
    typeof score.risk_score === 'number' &&
    score.risk_score >= HIGH_RISK_SCORE
  )
    return true;

  const verdict = (score.verdict ?? '').toLowerCase();
  if (verdict && verdict !== 'allow') return true; // block / challenge / review

  const band = (score.band ?? '').toLowerCase();
  if (
    ['suspicious', 'risky', 'bad', 'malicious', 'high', 'critical'].includes(
      band
    )
  )
    return true;

  const threat = (cls.threat_level ?? '').toLowerCase();
  if (['medium', 'high', 'critical', 'severe'].includes(threat)) return true;

  if (cls.is_proxy === true || cls.is_tor === true || cls.is_vpn === true)
    return true;

  return false;
}

function parseRateLimit(headers: Headers): IpbotRateLimit {
  const num = (v: string | null): number | null => {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    limit: num(headers.get('x-ratelimit-limit')),
    remaining: num(headers.get('x-ratelimit-remaining')),
    reset: num(headers.get('x-ratelimit-reset')),
    tier: headers.get('x-ratelimit-tier'),
    retryAfter: num(headers.get('retry-after')),
  };
}

function logRateLimit(ip: string, rl: IpbotRateLimit, event: string): void {
  // Structured single-line log so it is greppable in `wrangler tail`.
  console.log(
    JSON.stringify({
      msg: 'ipbot.ratelimit',
      event,
      ip,
      limit: rl.limit,
      remaining: rl.remaining,
      reset: rl.reset,
      tier: rl.tier,
      retryAfter: rl.retryAfter,
    })
  );
}

function backoffMs(attempt: number, retryAfter: number | null): number {
  if (retryAfter != null && retryAfter > 0) {
    return Math.min(retryAfter * 1000, MAX_BACKOFF_MS);
  }
  // 0.5s, 1s, 2s, ... capped.
  return Math.min(MAX_BACKOFF_MS, 500 * 2 ** attempt);
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromUpstream(
  ip: string,
  origin: string,
  apiKey: string
): Promise<{ data: IpbotResponse; rateLimit: IpbotRateLimit }> {
  const url = `${origin.replace(/\/+$/, '')}/v1/ip/${encodeURIComponent(ip)}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
    });
    const rateLimit = parseRateLimit(res.headers);

    if (res.status === 429) {
      logRateLimit(ip, rateLimit, 'throttled');
      if (attempt === MAX_RETRIES) {
        throw new IpbotError(
          'IPbot rate limit exceeded (429)',
          429,
          rateLimit.retryAfter
        );
      }
      await sleep(backoffMs(attempt, rateLimit.retryAfter));
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new IpbotError(
        `IPbot API error ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`,
        res.status
      );
    }

    const data = await res.json<IpbotResponse>();
    return { data, rateLimit };
  }

  // Unreachable: the loop either returns or throws.
  throw new IpbotError('IPbot request failed after retries', 429);
}

/**
 * Look up IP intelligence for `ip`, with KV caching, 429 backoff, and
 * rate-limit logging. Credentials come from `env` (never hardcoded).
 *
 * @example
 *   const { data, cached, highRisk } = await lookupIP('8.8.8.8', c.env);
 */
export async function lookupIP(
  ip: string,
  env: IpbotBindings
): Promise<IpbotLookupResult> {
  if (!isValidIp(ip)) {
    throw new IpbotError(`Invalid IP address: ${ip}`, 400);
  }

  const origin = env.IPBOT_API_ORIGIN;
  const apiKey = env.IPBOT_API_KEY;
  if (!origin || !apiKey) {
    throw new IpbotError(
      'IPBOT_API_ORIGIN or IPBOT_API_KEY is not configured',
      500
    );
  }

  const cacheKey = `${CACHE_PREFIX}${ip}`;

  // 1. Cache read.
  if (env.IP_CACHE) {
    const cached = await env.IP_CACHE.get<CachedEntry>(cacheKey, 'json');
    if (cached?.data) {
      return {
        data: cached.data,
        cached: true,
        highRisk: cached.highRisk ?? isHighRisk(cached.data),
        rateLimit: cached.rateLimit ?? emptyRateLimit(),
      };
    }
  }

  // 2. Fetch from upstream (with 429 backoff).
  const { data, rateLimit } = await fetchFromUpstream(ip, origin, apiKey);

  // 3. Record rate-limit headers for observability.
  logRateLimit(ip, rateLimit, 'fetched');

  // 4. Cache with risk-aware TTL.
  const highRisk = isHighRisk(data);
  if (env.IP_CACHE) {
    const entry: CachedEntry = {
      data,
      highRisk,
      rateLimit,
      cachedAt: Date.now(),
    };
    await env.IP_CACHE.put(cacheKey, JSON.stringify(entry), {
      expirationTtl: highRisk ? HOUR_SECONDS : DAY_SECONDS,
    });
  }

  return { data, cached: false, highRisk, rateLimit };
}
