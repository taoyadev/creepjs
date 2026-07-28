import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createMiddleware } from 'hono/factory';
import type { Env, RateLimitData, TokenData } from '../types';
import { authMiddleware } from '../middleware/auth';
import {
  rateLimitMiddleware,
  reserveRateLimit,
} from '../middleware/ratelimit';
import {
  IpbotError,
  isValidIp,
  lookupIP,
  type IpbotResponse,
} from '../services/ipbot';
import { IpBatchRequestSchema } from '../utils/validation';
import { logEvent } from '../utils/logging';
import { hashIpForLog } from '../utils/privacy';

const app = new Hono<Env>();

// Public (no-token) lookup limits. The IPbot upstream is paid + quota-limited,
// so the public endpoint is protected server-side instead of exposing the key.
const PUBLIC_PER_IP_DEFAULT = 30; // lookups per visitor IP per day
const PUBLIC_GLOBAL_DEFAULT = 2000; // total UNCACHED upstream calls per day
const DAY_MS = 24 * 60 * 60 * 1000;

function routeStatus(error: IpbotError): 400 | 429 | 502 | 503 {
  if (error.kind === 'input') return 400;
  if (error.kind === 'throttle' || error.status === 429) return 429;
  if (error.kind === 'configuration' || error.kind === 'network') return 503;
  return 502;
}

function safeIpbotMessage(error: IpbotError) {
  switch (error.kind) {
    case 'input':
      return error.message;
    case 'throttle':
      return 'IP intelligence provider rate limit exceeded';
    case 'configuration':
      return 'IP intelligence service is not configured';
    case 'network':
      return 'IP intelligence provider is temporarily unreachable';
    default:
      return 'IP intelligence provider is temporarily unavailable';
  }
}

function ipbotErrorResponse(c: Context<Env>, error: unknown) {
  if (error instanceof IpbotError) {
    const status = routeStatus(error);
    if (status === 429 && error.retryAfter) {
      c.header('Retry-After', String(error.retryAfter));
    }
    return c.json({ error: safeIpbotMessage(error), status }, status);
  }
  throw error;
}

async function recordTokenUsage(
  env: Env['Bindings'],
  token: string,
  tokenData: TokenData,
  increment = 1
) {
  await env.TOKENS.put(
    token,
    JSON.stringify({
      ...tokenData,
      usageCount: tokenData.usageCount + increment,
    } satisfies TokenData)
  );
}

/** One row of a batch lookup, always keyed by the normalized submitted IP. */
type BatchItem =
  | {
      ip: string;
      ok: true;
      outcome: 'success';
      data: IpbotResponse;
      cached: boolean;
      highRisk: boolean;
    }
  | {
      ip: string;
      ok: false;
      outcome: 'invalid' | 'failed' | 'skipped';
      error: string;
      status?: number;
    };

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
  const visitorHash = await hashIpForLog(visitor);
  const targetHash = await hashIpForLog(ip);
  const perIpKey = `pubip:ip:${visitorHash}`;
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
      ip_hash: targetHash,
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

const BATCH_BODY_LIMIT_BYTES = 8 * 1024;

const batchBodyTooLarge = (c: Context<Env>) =>
  c.json(
    {
      error: 'Request body exceeds the 8 KiB limit',
      status: 413,
    },
    413
  );

/** Measure a cloned body so chunked and Content-Length requests share one cap. */
const batchBodyLimit = createMiddleware<Env>(async (c, next) => {
  const contentLength = Number(c.req.header('content-length'));
  if (Number.isFinite(contentLength) && contentLength > BATCH_BODY_LIMIT_BYTES) {
    return batchBodyTooLarge(c);
  }

  const reader = c.req.raw.clone().body?.getReader();
  if (!reader) {
    await next();
    return;
  }

  try {
    let size = 0;
    while (true) {
      const { done, value } = (await reader.read()) as ReadableStreamReadResult<
        Uint8Array<ArrayBuffer>
      >;
      if (done) break;
      size += value.byteLength;
      if (size > BATCH_BODY_LIMIT_BYTES) {
        await reader.cancel();
        return batchBodyTooLarge(c);
      }
    }
  } catch {
    return batchBodyTooLarge(c);
  }
  await next();
});

function batchFailure(error: IpbotError) {
  const status = routeStatus(error);
  const abortedReason =
    error.kind === 'throttle'
      ? 'provider-rate-limited'
      : error.kind === 'configuration'
        ? 'provider-configuration'
        : error.kind === 'network'
          ? 'provider-unreachable'
          : 'provider-unavailable';
  return {
    status,
    abortedReason,
    error: safeIpbotMessage(error),
    retryAfter: error.retryAfter ?? undefined,
  };
}

/**
 * Token-gated batch lookup. Envelope validation precedes weighted quota
 * reservation; the complete lookup-unit cost is reserved before any provider
 * call. Valid addresses execute serially with one retry, and the first
 * dependency-wide failure aborts all later valid lookups.
 */
app.post(
  '/batch',
  batchBodyLimit,
  authMiddleware,
  zValidator('json', IpBatchRequestSchema),
  async (c) => {
    const { ips } = c.req.valid('json');

    // The schema already trims and bounds each item. Dedupe while preserving
    // first-seen order so response rows have a deterministic contract.
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const ip of ips) {
      if (!seen.has(ip)) {
        seen.add(ip);
        unique.push(ip);
      }
    }

    const valid = unique.filter(isValidIp);
    const validSet = new Set(valid);
    const quotaCost = Math.max(1, valid.length);
    const reservation = await reserveRateLimit(c, quotaCost);

    if (!reservation.allowed) {
      logEvent({
        msg: 'ip.batch_lookup',
        request_id: c.get('requestId'),
        status: 429,
        submitted: ips.length,
        unique: unique.length,
        valid: valid.length,
        quota_cost: quotaCost,
        reserved: false,
        aborted: false,
      });
      return c.json(
        {
          error: 'Rate limit exceeded',
          status: 429,
          quotaCost,
          limit: reservation.limit,
          remaining: reservation.remaining,
          resetIn: reservation.resetIn,
        },
        429
      );
    }

    const resultByIp = new Map<string, BatchItem>();
    for (const ip of unique) {
      if (!validSet.has(ip)) {
        resultByIp.set(ip, {
          ip,
          ok: false,
          outcome: 'invalid',
          error: 'Invalid IP address',
          status: 400,
        });
      }
    }

    let successCount = 0;
    let cachedCount = 0;
    let highRiskCount = 0;
    let lastRemaining: number | null = null;
    let aborted:
      | {
          status: 400 | 429 | 502 | 503;
          abortedReason: string;
          error: string;
          retryAfter?: number;
          failedIp: string;
          failedIndex: number;
        }
      | undefined;

    for (const [index, ip] of valid.entries()) {
      try {
        const result = await lookupIP(ip, c.env, { maxRetries: 1 });
        successCount += 1;
        if (result.cached) cachedCount += 1;
        if (result.highRisk) highRiskCount += 1;
        if (result.rateLimit.remaining != null) {
          lastRemaining = result.rateLimit.remaining;
        }
        resultByIp.set(ip, {
          ip,
          ok: true,
          outcome: 'success',
          data: result.data,
          cached: result.cached,
          highRisk: result.highRisk,
        });
      } catch (error) {
        if (error instanceof IpbotError) {
          const failure = batchFailure(error);
          resultByIp.set(ip, {
            ip,
            ok: false,
            outcome: 'failed',
            error: failure.error,
            status: failure.status,
          });
          aborted = {
            ...failure,
            failedIp: ip,
            failedIndex: index,
          };
          break;
        }
        throw error; // unexpected — let the error middleware handle it
      }
    }

    if (aborted) {
      for (const ip of valid.slice(aborted.failedIndex + 1)) {
        resultByIp.set(ip, {
          ip,
          ok: false,
          outcome: 'skipped',
          error: 'Skipped after a dependency failure',
        });
      }
    }

    if (successCount > 0) {
      try {
        await recordTokenUsage(
          c.env,
          c.get('token'),
          c.get('tokenData'),
          successCount
        );
      } catch {
        // usageCount is explicitly approximate telemetry; a failed telemetry
        // write must not discard already-resolved batch results.
        logEvent({
          msg: 'ip.batch_usage_write_failed',
          request_id: c.get('requestId'),
          success_count: successCount,
        });
      }
    }

    const results = unique.map((ip) => resultByIp.get(ip)!);
    const invalidCount = results.filter(
      (item) => !item.ok && item.outcome === 'invalid'
    ).length;
    const dependencyFailureCount = results.filter(
      (item) => !item.ok && item.outcome === 'failed'
    ).length;
    const skippedCount = results.filter(
      (item) => !item.ok && item.outcome === 'skipped'
    ).length;

    logEvent({
      msg: 'ip.batch_lookup',
      request_id: c.get('requestId'),
      status: aborted && successCount === 0 ? aborted.status : 200,
      requested: ips.length,
      unique: unique.length,
      valid: valid.length,
      succeeded: successCount,
      invalid: invalidCount,
      failed: dependencyFailureCount,
      skipped: skippedCount,
      cached: cachedCount,
      high_risk: highRiskCount,
      quota_cost: quotaCost,
      reserved: true,
      aborted: Boolean(aborted),
      aborted_reason: aborted?.abortedReason ?? null,
      ipbot_remaining: lastRemaining,
    });

    if (aborted && successCount === 0) {
      if (aborted.retryAfter) {
        c.header('Retry-After', String(aborted.retryAfter));
      }
      return c.json(
        {
          error: aborted.error,
          status: aborted.status,
          aborted: true,
          abortedReason: aborted.abortedReason,
          retryAfter: aborted.retryAfter,
        },
        aborted.status
      );
    }

    if (aborted?.retryAfter) {
      c.header('Retry-After', String(aborted.retryAfter));
    }
    return c.json({
      count: results.length,
      submittedCount: ips.length,
      uniqueCount: unique.length,
      validCount: valid.length,
      successCount,
      invalidCount,
      failedCount: invalidCount + dependencyFailureCount,
      skippedCount,
      cachedCount,
      highRiskCount,
      quotaCost,
      aborted: Boolean(aborted),
      abortedReason: aborted?.abortedReason,
      retryAfter: aborted?.retryAfter,
      results,
    });
  }
);

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
      ip_hash: await hashIpForLog(ip),
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
