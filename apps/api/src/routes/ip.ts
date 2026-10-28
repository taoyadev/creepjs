import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import {
  rateLimitMiddleware,
  refundRateLimit,
  reserveRateLimit,
} from '../middleware/ratelimit';
import {
  IpbotError,
  isValidIp,
  lookupIP,
  readCachedLookup,
  type IpbotLookupResult,
  type IpbotResponse,
} from '../services/ipbot';
import { IpBatchRequestSchema } from '../utils/validation';
import { logEvent } from '../utils/logging';
import { hashIpForLog } from '../utils/privacy';
import { intEnv, visitorQuotaKey } from '../utils/counters';
import { releaseQuota, reserveQuota, resetInSeconds } from '../utils/quota';

const app = new Hono<Env>();

// Public (no-token) lookup limits. The IPbot upstream is paid + quota-limited,
// so the public endpoint is protected server-side instead of exposing the key.
const PUBLIC_PER_IP_DEFAULT = 30; // lookups per visitor IP per day
const PUBLIC_GLOBAL_DEFAULT = 2000; // total UNCACHED upstream calls per day
const TOKEN_GLOBAL_DEFAULT = 10000; // UNCACHED token-path upstream calls per day
const TOKEN_GLOBAL_KEY = 'tokenip:global';

const tokenGlobalLimit = (c: Context<Env>) =>
  intEnv(c.env.TOKEN_IP_DAILY_GLOBAL, TOKEN_GLOBAL_DEFAULT);

const tokenLookupsAtCapacity = (c: Context<Env>) =>
  c.json(
    {
      error: 'IP lookups are temporarily at capacity. Try again later.',
      status: 503,
    },
    503
  );

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
  const targetHash = await hashIpForLog(ip);
  const perIpKey = await visitorQuotaKey(c, 'pubip:ip');
  const globalKey = 'pubip:global';

  // 1. Per-visitor-IP daily limit. Reserved up front so concurrent requests
  //    cannot all pass on the same pre-increment count.
  const perIp = await reserveQuota(c.env, perIpKey, { limit: perIpLimit });
  if (!perIp.allowed) {
    const retryIn = resetInSeconds(perIp.resetAt);
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

  // 2. Global daily cap (protects the paid upstream quota). It meters only
  //    upstream calls, so a cache hit skips it rather than reserving and
  //    refunding: two Durable Object round trips saved on every hit.
  let result: IpbotLookupResult | null = await readCachedLookup(ip, c.env);
  let globalCount: number | null = null;
  if (!result) {
    const global = await reserveQuota(c.env, globalKey, {
      limit: globalLimit,
    });
    if (!global.allowed) {
      await releaseQuota(c.env, perIpKey);
      return c.json(
        {
          error:
            'Public IP lookups are temporarily at capacity. Try again later.',
          status: 503,
        },
        503
      );
    }
    globalCount = global.count;
  }

  try {
    if (!result) {
      result = await lookupIP(ip, c.env);
      // Filled by a concurrent request in the meantime: nothing upstream.
      if (result.cached && globalCount !== null) {
        await releaseQuota(c.env, globalKey);
        globalCount -= 1;
      }
    }

    const remaining = Math.max(0, perIpLimit - perIp.count);
    logEvent({
      msg: 'ip.public_lookup',
      request_id: c.get('requestId'),
      ip_hash: targetHash,
      cached: result.cached,
      high_risk: result.highRisk,
      public_remaining: remaining,
      global_count: globalCount,
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
    // The lookup never happened, so neither reservation was spent.
    await releaseQuota(c.env, perIpKey);
    if (globalCount !== null) await releaseQuota(c.env, globalKey);
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
  if (
    Number.isFinite(contentLength) &&
    contentLength > BATCH_BODY_LIMIT_BYTES
  ) {
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
          /** First valid row that was not looked up. */
          skipFrom: number;
          skipReason: string;
        }
      | undefined;
    const globalLimit = tokenGlobalLimit(c);

    for (const [index, ip] of valid.entries()) {
      let globalReserved = false;
      try {
        let result = await readCachedLookup(ip, c.env);
        if (!result) {
          const global = await reserveQuota(c.env, TOKEN_GLOBAL_KEY, {
            limit: globalLimit,
          });
          if (!global.allowed) {
            aborted = {
              status: 503,
              abortedReason: 'capacity',
              error: 'IP lookups are temporarily at capacity. Try again later.',
              skipFrom: index,
              skipReason: 'Skipped: daily lookup capacity reached',
            };
            break;
          }
          globalReserved = true;
          result = await lookupIP(ip, c.env, { maxRetries: 1 });
          if (result.cached) await releaseQuota(c.env, TOKEN_GLOBAL_KEY);
        }
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
        if (globalReserved) await releaseQuota(c.env, TOKEN_GLOBAL_KEY);
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
            skipFrom: index + 1,
            skipReason: 'Skipped after a dependency failure',
          };
          break;
        }
        throw error; // unexpected — let the error middleware handle it
      }
    }

    if (aborted) {
      const skipped = valid.slice(aborted.skipFrom);
      for (const ip of skipped) {
        resultByIp.set(ip, {
          ip,
          ok: false,
          outcome: 'skipped',
          error: aborted.skipReason,
        });
      }
      // Rows never looked up because of the shared cap cost the caller nothing.
      if (aborted.abortedReason === 'capacity' && skipped.length > 0) {
        await refundRateLimit(c, { ...reservation, cost: skipped.length });
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
  const ip = c.req.param('ip');
  // Like the public path, every token shares one daily cap on upstream calls,
  // reserved only on a cache miss.
  let result: IpbotLookupResult | null = await readCachedLookup(ip, c.env);
  let globalReserved = false;
  if (!result && isValidIp(ip)) {
    const global = await reserveQuota(c.env, TOKEN_GLOBAL_KEY, {
      limit: tokenGlobalLimit(c),
    });
    if (!global.allowed) {
      await refundRateLimit(c, c.get('quotaReservation'));
      return tokenLookupsAtCapacity(c);
    }
    globalReserved = true;
  }

  try {
    if (!result) {
      result = await lookupIP(ip, c.env);
      if (result.cached && globalReserved) {
        await releaseQuota(c.env, TOKEN_GLOBAL_KEY);
      }
    }
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
    if (globalReserved) await releaseQuota(c.env, TOKEN_GLOBAL_KEY);
    return ipbotErrorResponse(c, error);
  }
});

export default app;
