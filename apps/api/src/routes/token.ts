import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import type { Env, RateLimitData, TokenData } from '../types';
import { TokenRequestSchema } from '../utils/validation';
import { generateFingerprintId } from '@creepjs/core';

const app = new Hono<Env>();

const TOKEN_RATE_LIMIT_PER_DAY = 10;
const TOKEN_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const TOKEN_RATE_LIMIT_TTL_SECONDS = 24 * 60 * 60;

function getClientIp(c: Context<Env>): string {
  const cfConnectingIp = c.req.header('CF-Connecting-IP');
  const cfConnectingIpLower = c.req.header('cf-connecting-ip');
  const xForwardedFor = c.req.header('X-Forwarded-For');
  const xForwardedForLower = c.req.header('x-forwarded-for');
  const xRealIp = c.req.header('X-Real-IP');
  const xRealIpLower = c.req.header('x-real-ip');

  const forwarded = xForwardedFor || xForwardedForLower;
  const forwardedIp = forwarded?.split(',')[0]?.trim();

  return (
    (cfConnectingIp || cfConnectingIpLower)?.trim() ||
    (xRealIp || xRealIpLower)?.trim() ||
    forwardedIp ||
    'unknown'
  );
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checkTokenRateLimit(
  c: Context<Env>,
  ip: string
): Promise<boolean> {
  const ipKey = await sha256Hex(ip);
  const rateLimitKey = `token-ratelimit:${ipKey}`;

  const now = Date.now();
  const stored = await c.env.RATE_LIMIT.get<RateLimitData>(
    rateLimitKey,
    'json'
  );

  const resetAt =
    stored && now < stored.resetAt
      ? stored.resetAt
      : now + TOKEN_RATE_LIMIT_WINDOW_MS;
  const count = stored && now < stored.resetAt ? stored.count : 0;

  if (count >= TOKEN_RATE_LIMIT_PER_DAY) {
    return false;
  }

  await c.env.RATE_LIMIT.put(
    rateLimitKey,
    JSON.stringify({ count: count + 1, resetAt } satisfies RateLimitData),
    { expirationTtl: TOKEN_RATE_LIMIT_TTL_SECONDS }
  );

  return true;
}

app.post('/', zValidator('json', TokenRequestSchema), async (c) => {
  const { email } = c.req.valid('json');
  const ip = getClientIp(c);

  // Check rate limit
  if (!(await checkTokenRateLimit(c, ip))) {
    return c.json(
      {
        error: 'Rate limit exceeded. Try again in 24 hours.',
      },
      429
    );
  }

  // Generate token
  const token = `cfp_${generateFingerprintId({ email, timestamp: Date.now() })}`;

  // Store token data
  const tokenData: TokenData = {
    email,
    createdAt: Date.now(),
    usageCount: 0,
  };

  await c.env.TOKENS.put(token, JSON.stringify(tokenData));

  return c.json({
    token,
    email,
    createdAt: tokenData.createdAt,
  });
});

export default app;
