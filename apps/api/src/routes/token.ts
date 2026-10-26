import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, TokenData } from '../types';
import { TokenRequestSchema } from '../utils/validation';
import { sha256Hex } from '../utils/privacy';
import { normalizeEmailIdentity } from '../utils/email';
import { intEnv, visitorQuotaKey } from '../utils/counters';
import { DAY_MS, releaseQuota, reserveQuota } from '../utils/quota';

const app = new Hono<Env>();

const TOKEN_RATE_LIMIT_PER_DAY = 10;
/**
 * Tokens per inbox per day. Lower than the per-IP cap because the daily request
 * allowance is now shared across an inbox's tokens, so more tokens buy no extra
 * capacity — this only bounds how much KV one requester can fill.
 */
const TOKEN_LIMIT_PER_EMAIL_PER_DAY = 3;
/**
 * Tokens minted per day across all requesters. Addresses are not verified, so
 * the per-IP and per-inbox caps still let anyone with many IPs and made-up
 * inboxes mint without bound, and every token carries a daily allowance of
 * paid lookups. This bounds how fast that pool can grow.
 */
const TOKEN_MINT_DAILY_GLOBAL_DEFAULT = 100;
const GLOBAL_MINT_KEY = 'token-mint:global';

const BASE62 =
  '0123456789' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz';
const TOKEN_LENGTH = 24; // 24 base62 chars ≈ 142 bits of entropy

/**
 * CSPRNG token. Tokens are bearer credentials, so they must be unguessable —
 * unlike the previous deterministic 32-bit content hash. Rejection sampling
 * keeps the base62 mapping unbiased. Existing tokens keep working: auth is a
 * literal KV lookup, not a format check.
 */
function generateToken(): string {
  let out = '';
  while (out.length < TOKEN_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_LENGTH * 2));
    for (const b of bytes) {
      if (out.length === TOKEN_LENGTH) break;
      if (b < 248) out += BASE62[b % 62]; // 248 = 62*4 → unbiased
    }
  }
  return `cfp_${out}`;
}

app.post('/', zValidator('json', TokenRequestSchema), async (c) => {
  const { email } = c.req.valid('json');

  const ipKey = await visitorQuotaKey(c, 'token-mint:ip');
  const ipReservation = await reserveQuota(c.env, ipKey, {
    limit: TOKEN_RATE_LIMIT_PER_DAY,
    windowMs: DAY_MS,
  });
  if (!ipReservation.allowed) {
    return c.json(
      { error: 'Rate limit exceeded. Try again in 24 hours.' },
      429
    );
  }

  // Minting from many addresses that reach one inbox was the cheap way to farm
  // allowance, so the inbox is metered too.
  const identity = normalizeEmailIdentity(email);
  const emailKey = `token-mint:email:${await sha256Hex(identity)}`;
  const emailReservation = await reserveQuota(c.env, emailKey, {
    limit: TOKEN_LIMIT_PER_EMAIL_PER_DAY,
    windowMs: DAY_MS,
  });
  if (!emailReservation.allowed) {
    // The request never reached issuance, so the IP reservation is refunded.
    await releaseQuota(c.env, ipKey);
    return c.json(
      {
        error: `This address has reached its daily limit of ${TOKEN_LIMIT_PER_EMAIL_PER_DAY} tokens. Existing tokens keep working.`,
      },
      429
    );
  }

  const globalReservation = await reserveQuota(c.env, GLOBAL_MINT_KEY, {
    limit: intEnv(
      c.env.TOKEN_MINT_DAILY_GLOBAL,
      TOKEN_MINT_DAILY_GLOBAL_DEFAULT
    ),
    windowMs: DAY_MS,
  });
  if (!globalReservation.allowed) {
    await releaseQuota(c.env, ipKey);
    await releaseQuota(c.env, emailKey);
    return c.json(
      {
        error:
          'Token issuance is at capacity for today. Try again tomorrow; existing tokens keep working.',
      },
      503
    );
  }

  const token = generateToken();

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
