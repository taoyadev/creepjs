import { createMiddleware } from 'hono/factory';
import type { Env, TokenData } from '../types';

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = c.req.header('X-API-Token');

  if (!token) {
    return c.json({ error: 'Missing API token' }, 401);
  }

  // Verify token exists in KV
  const tokenData = await c.env.TOKENS.get<TokenData>(token, 'json');

  if (!tokenData) {
    return c.json({ error: 'Invalid API token' }, 401);
  }

  // Store token data in context
  c.set('tokenData', tokenData);
  c.set('token', token);

  await next();
});
