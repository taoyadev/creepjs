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
 * - /v1/events records the site's own product analytics → locked to the same
 *   site origin, which the route also enforces on the request itself.
 * - /v1/sponsor-inquiries stores advertiser emails from the site's dialog →
 *   site origin, enforced on the request as well.
 */
export const siteOrigin = (env: Env['Bindings']): string => {
  const rawOrigin = env.CORS_ORIGIN?.trim();
  if (rawOrigin && rawOrigin.length > 0 && rawOrigin !== '*') return rawOrigin;
  return env.ENVIRONMENT === 'production' ? 'https://creepjs.org' : '*';
};

const isSiteOnlyRoute = (path: string): boolean =>
  ['/v1/token', '/v1/events', '/v1/sponsor-inquiries'].some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

export const corsMiddleware = createMiddleware<Env>((c, next) => {
  const path = new URL(c.req.url).pathname;
  const origin = isSiteOnlyRoute(path) ? siteOrigin(c.env) : '*';

  const handler = cors({
    origin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-API-Token'],
    // Without this, cross-origin callers (the site, SDK users) read null for
    // every quota header and cannot honour Retry-After.
    exposeHeaders: [
      'Retry-After',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-Id',
    ],
    maxAge: 86400,
  });

  return handler(c, next);
});
