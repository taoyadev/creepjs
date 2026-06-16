import { Hono, type Context } from 'hono';
import type { Env, RateLimitData, TokenData } from '../types';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';
import { IpbotError, isValidIp, lookupIP } from '../services/ipbot';
import { logEvent } from '../utils/logging';

const app = new Hono<Env>();

// Public (no-token) lookup limits. The IPbot upstream is paid + quota-limited,
// so the public endpoint is protected server-side instead of exposing the key.
const PUBLIC_PER_IP_DEFAULT = 30; // lookups per visitor IP per day
const PUBLIC_GLOBAL_DEFAULT = 2000; // total UNCACHED upstream calls per day
const DAY_MS = 24 * 60 * 60 * 1000;

function routeStatus(error: IpbotError) {
  if (error.status === 400) return 400;
  if (error.status === 429) return 429;
  if (error.status === 500 && /not configured/i.test(error.message)) return 500;
  return 502;
}

function ipbotErrorResponse(c: Context<Env>, error: unknown) {
  if (error instanceof IpbotError) {
    const status = routeStatus(error);
    if (status === 429 && error.retryAfter) {
      c.header('Retry-After', String(error.retryAfter));
    }
    return c.json({ error: error.message, status }, status);
  }
  throw error;
}

async function recordTokenUsage(
  env: Env['Bindings'],
  token: string,
  tokenData: TokenData
) {
  await env.TOKENS.put(
    token,
    JSON.stringify({
      ...tokenData,
      usageCount: tokenData.usageCount + 1,
    } satisfies TokenData)
  );
}

const intEnv = (value: string | undefined, fallback: number) => {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const clientIp = (c: Context<Env>) =>
  (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0] ||
    '0.0.0.0'
  ).trim();

/**
 * Read a rolling-daily counter without incrementing.
 * Returns `{ count, resetAt }` for the active window (count 0 if expired).
 */
async function readCounter(env: Env['Bindings'], key: string) {
  const now = Date.now();
  const data = await env.RATE_LIMIT.get<RateLimitData>(key, 'json');
  if (data && now < data.resetAt)
    return { count: data.count, resetAt: data.resetAt };
  return { count: 0, resetAt: now + DAY_MS };
}

async function bumpCounter(
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
    { expirationTtl: 86400 }
  );
}

/**
 * Public IP intelligence — no token required. Protected by a per-visitor-IP
 * daily limit and a global daily cap on upstream (uncached) calls so the paid
 * IPbot quota cannot be exhausted by abuse. The IPbot key is never exposed.
 */
app.get('/public/:ip', async (c) => {
  const ip = c.req.param('ip');
  if (!isValidIp(ip)) {
    return c.json({ error: `Invalid IP address: ${ip}`, status: 400 }, 400);
  }

  const perIpLimit = intEnv(
    c.env.PUBLIC_IP_DAILY_PER_IP,
    PUBLIC_PER_IP_DEFAULT
  );
  const globalLimit = intEnv(
    c.env.PUBLIC_IP_DAILY_GLOBAL,
    PUBLIC_GLOBAL_DEFAULT
  );
  const visitor = clientIp(c);
  const perIpKey = `pubip:ip:${visitor}`;
  const globalKey = 'pubip:global';

  // 1. Per-visitor-IP daily limit.
  const perIp = await readCounter(c.env, perIpKey);
  if (perIp.count >= perIpLimit) {
    const retryIn = Math.max(1, Math.ceil((perIp.resetAt - Date.now()) / 1000));
    c.header('Retry-After', String(retryIn));
    return c.json(
      {
        error: `Daily free lookup limit reached (${perIpLimit}/day). Try again later or use the token API for higher limits.`,
        limit: perIpLimit,
        retryIn,
        status: 429,
      },
      429
    );
  }

  // 2. Global daily cap (protects the paid upstream quota).
  const global = await readCounter(c.env, globalKey);
  if (global.count >= globalLimit) {
    return c.json(
      {
        error:
          'Public IP lookups are temporarily at capacity. Try again later.',
        status: 503,
      },
      503
    );
  }

  try {
    const result = await lookupIP(ip, c.env);

    // Count this visitor's request; count global only for real upstream calls.
    await bumpCounter(c.env, perIpKey, perIp);
    if (!result.cached) await bumpCounter(c.env, globalKey, global);

    const remaining = Math.max(0, perIpLimit - (perIp.count + 1));
    logEvent({
      msg: 'ip.public_lookup',
      request_id: c.get('requestId'),
      ip,
      cached: result.cached,
      high_risk: result.highRisk,
      public_remaining: remaining,
      global_count: result.cached ? global.count : global.count + 1,
      ipbot_remaining: result.rateLimit.remaining,
    });
    return c.json({
      data: result.data,
      cached: result.cached,
      highRisk: result.highRisk,
      // Public quota (not the upstream IPbot quota — that stays server-side).
      rateLimit: {
        limit: perIpLimit,
        remaining,
        reset: Math.floor(perIp.resetAt / 1000),
        tier: 'public',
      },
    });
  } catch (error) {
    return ipbotErrorResponse(c, error);
  }
});

/**
 * Token-gated lookup — for developers / programmatic use (higher quota).
 */
app.get('/:ip', authMiddleware, rateLimitMiddleware, async (c) => {
  try {
    const ip = c.req.param('ip');
    const result = await lookupIP(ip, c.env);
    await recordTokenUsage(c.env, c.get('token'), c.get('tokenData'));
    logEvent({
      msg: 'ip.token_lookup',
      request_id: c.get('requestId'),
      ip,
      cached: result.cached,
      high_risk: result.highRisk,
      ipbot_remaining: result.rateLimit.remaining,
      ipbot_tier: result.rateLimit.tier,
    });
    return c.json(result);
  } catch (error) {
    return ipbotErrorResponse(c, error);
  }
});

export default app;
