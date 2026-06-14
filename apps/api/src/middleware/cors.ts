import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

export const corsMiddleware = createMiddleware<Env>((c, next) => {
  const handler = cors({
    origin: c.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-API-Token'],
    maxAge: 86400,
  });

  return handler(c, next);
});
