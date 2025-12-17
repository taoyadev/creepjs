import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, TokenData } from '../types';
import { TokenRequestSchema } from '../utils/validation';
import { generateFingerprintId } from '@creepjs/core';

const app = new Hono<Env>();

// Simple IP-based rate limiting for token generation
const tokenRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkTokenRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = tokenRateLimits.get(ip);

  if (!limit) {
    tokenRateLimits.set(ip, { count: 1, resetAt: now + 86400000 }); // 24 hours
    return true;
  }

  if (now > limit.resetAt) {
    tokenRateLimits.set(ip, { count: 1, resetAt: now + 86400000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

export function resetTokenRateLimits(): void {
  tokenRateLimits.clear();
}

app.post('/', zValidator('json', TokenRequestSchema), async (c) => {
  const { email } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';

  // Check rate limit
  if (!checkTokenRateLimit(ip)) {
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
