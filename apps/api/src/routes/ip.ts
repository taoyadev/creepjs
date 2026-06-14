import { Hono } from 'hono';
import type { Env, TokenData } from '../types';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';
import { IpbotError, lookupIP } from '../services/ipbot';

const app = new Hono<Env>();

function routeStatus(error: IpbotError) {
  if (error.status === 400) return 400;
  if (error.status === 429) return 429;
  if (error.status === 500 && /not configured/i.test(error.message)) return 500;
  return 502;
}

async function recordTokenUsage(env: Env['Bindings'], token: string, tokenData: TokenData) {
  await env.TOKENS.put(
    token,
    JSON.stringify({
      ...tokenData,
      usageCount: tokenData.usageCount + 1,
    } satisfies TokenData)
  );
}

app.get('/:ip', authMiddleware, rateLimitMiddleware, async (c) => {
  try {
    const ip = c.req.param('ip');
    const result = await lookupIP(ip, c.env);

    await recordTokenUsage(c.env, c.get('token'), c.get('tokenData'));

    return c.json(result);
  } catch (error) {
    if (error instanceof IpbotError) {
      const status = routeStatus(error);

      if (status === 429 && error.retryAfter) {
        c.header('Retry-After', String(error.retryAfter));
      }

      return c.json(
        {
          error: error.message,
          status,
        },
        status
      );
    }

    throw error;
  }
});

export default app;
