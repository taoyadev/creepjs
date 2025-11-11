import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, TokenData } from '../types';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';
import { FingerprintRequestSchema } from '../utils/validation';

const app = new Hono<Env>();

app.post(
  '/',
  authMiddleware,
  rateLimitMiddleware,
  zValidator('json', FingerprintRequestSchema),
  async (c) => {
    const data = c.req.valid('json');
    const token = c.get('token');
    const tokenData = c.get('tokenData');

    // Update token usage count
    const updatedTokenData: TokenData = {
      ...tokenData,
      usageCount: tokenData.usageCount + 1,
    };

    await c.env.TOKENS.put(token, JSON.stringify(updatedTokenData));

    // Return fingerprint response
    return c.json({
      fingerprintId: data.fingerprintId,
      timestamp: Date.now(),
      confidence: data.confidence,
      collectors: data.collectors,
      timings: data.timings,
    });
  }
);

export default app;
