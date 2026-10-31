import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types';
import { siteOrigin } from '../middleware/cors';
import { visitorQuotaKey } from '../utils/counters';
import { DAY_MS, releaseQuota, reserveQuota } from '../utils/quota';
import { SponsorInquirySchema, validationErrorHook } from '../utils/validation';

const app = new Hono<Env>();

/** Inquiries per visitor per day; a real advertiser sends one. */
export const INQUIRY_LIMIT_PER_IP_PER_DAY = 3;
/** Inquiries per day across everyone, bounding KV writes from spam. */
export const INQUIRY_LIMIT_GLOBAL_PER_DAY = 50;
/** Replies happen within days; unanswered records expire on their own. */
export const INQUIRY_TTL_SECONDS = 180 * 24 * 60 * 60;
const GLOBAL_KEY = 'sponsor-inquiry:global';

/**
 * POST /v1/sponsor-inquiries — an advertiser leaves an email (and optionally
 * a website) from the sidebar "Advertise here" dialog. The operator reads the
 * records with `wrangler kv key list --binding SPONSOR_INQUIRIES`.
 *
 * Site origin only, rate-limited, and stored in a dedicated namespace: never
 * in TOKENS, where auth is a literal key lookup.
 */
app.post(
  '/',
  async (c, next) => {
    const origin = c.req.header('Origin');
    const allowed = siteOrigin(c.env);
    if (!origin || (allowed !== '*' && origin !== allowed)) {
      return c.json({ error: 'Origin not allowed' }, 403);
    }
    if (!c.env.SPONSOR_INQUIRIES) {
      return c.json({ error: 'Advertising requests are not open yet.' }, 503);
    }
    await next();
  },
  zValidator('json', SponsorInquirySchema, validationErrorHook),
  async (c) => {
    const store = c.env.SPONSOR_INQUIRIES!;
    const { email, website } = c.req.valid('json');

    const ipKey = await visitorQuotaKey(c, 'sponsor-inquiry:ip');
    const ip = await reserveQuota(c.env, ipKey, {
      limit: INQUIRY_LIMIT_PER_IP_PER_DAY,
      windowMs: DAY_MS,
    });
    if (!ip.allowed) {
      return c.json(
        { error: 'Too many requests today. Try again tomorrow.' },
        429
      );
    }
    const global = await reserveQuota(c.env, GLOBAL_KEY, {
      limit: INQUIRY_LIMIT_GLOBAL_PER_DAY,
      windowMs: DAY_MS,
    });
    if (!global.allowed) {
      await releaseQuota(c.env, ipKey);
      return c.json({ error: 'We have reached today’s request limit.' }, 503);
    }

    const createdAt = new Date().toISOString();
    await store.put(
      `inquiry:${createdAt}:${crypto.randomUUID()}`,
      JSON.stringify({ email, website: website ?? null, createdAt }),
      { expirationTtl: INQUIRY_TTL_SECONDS }
    );
    return c.json({ ok: true }, 202);
  }
);

export default app;
