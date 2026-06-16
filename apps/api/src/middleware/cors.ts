import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

export const corsMiddleware = createMiddleware<Env>((c, next) => {
  const rawOrigin = c.env.CORS_ORIGIN?.trim();
  const isProd = c.env.ENVIRONMENT === 'production';
  const fallbackOrigin = isProd ? 'https://creepjs.org' : '*';
  const configuredOrigin =
    rawOrigin && rawOrigin.length > 0 ? rawOrigin : fallbackOrigin;

  const handler = cors({
    origin: configuredOrigin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-API-Token'],
    maxAge: 86400,
  });

  return handler(c, next);
});
