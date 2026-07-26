import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

/**
 * Per-route CORS posture:
 *
 * - Data endpoints (/v1/fingerprint, /v1/ip/*, /v1/stats/*, /my-ip, health)
 *   are a public API consumed cross-origin by SDK users → origin `*` by
 *   design. CORS is not the security boundary there; token auth and rate
 *   limits are.
 * - /v1/token mints credentials from a browser context → locked to the
 *   site origin (CORS_ORIGIN, falling back to https://creepjs.org in
 *   production) so third-party pages cannot silently mint tokens with a
 *   visitor's browser.
 */
export const corsMiddleware = createMiddleware<Env>((c, next) => {
  const path = new URL(c.req.url).pathname;
  const isTokenRoute =
    path === '/v1/token' || path.startsWith('/v1/token/');

  let origin = '*';
  if (isTokenRoute) {
    const rawOrigin = c.env.CORS_ORIGIN?.trim();
    const isProd = c.env.ENVIRONMENT === 'production';
    const fallbackOrigin = isProd ? 'https://creepjs.org' : '*';
    origin =
      rawOrigin && rawOrigin.length > 0 && rawOrigin !== '*'
        ? rawOrigin
        : fallbackOrigin;
  }

  const handler = cors({
    origin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-API-Token'],
    maxAge: 86400,
  });

  return handler(c, next);
});
