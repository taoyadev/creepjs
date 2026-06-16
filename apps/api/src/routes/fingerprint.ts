import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, TokenData } from '../types';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';
import { FingerprintRequestSchema } from '../utils/validation';
import { recordUniquenessStats } from '../services/uniqueness';
import { logEvent } from '../utils/logging';

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
    await recordUniquenessStats(data.data, c.env);

    // Return fingerprint response
    const coverage = data.coverage ?? {
      ratio: data.confidence,
      successful: 0,
      failed: 0,
      skipped: 0,
    };

    logEvent({
      msg: 'fingerprint.accepted',
      request_id: c.get('requestId'),
      token_usage_count: updatedTokenData.usageCount,
      fingerprint_id: data.fingerprintId,
      coverage_ratio: coverage.ratio,
      coverage_successful: coverage.successful,
      coverage_failed: coverage.failed,
      coverage_skipped: coverage.skipped,
    });

    return c.json({
      fingerprintId: data.fingerprintId,
      data: data.data,
      timestamp: Date.now(),
      confidence: data.confidence,
      coverage,
      collectors: data.collectors,
      timings: data.timings,
    });
  }
);

export default app;
