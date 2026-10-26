import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { FingerprintData } from '@creepjs/core';
import { computeFingerprintId } from '@creepjs/core';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';
import { FingerprintRequestSchema } from '../utils/validation';
import { recordUniquenessStats } from '../services/uniqueness';
import { logEvent, runAfterResponse } from '../utils/logging';

const app = new Hono<Env>();

app.post(
  '/',
  authMiddleware,
  rateLimitMiddleware,
  zValidator('json', FingerprintRequestSchema),
  async (c) => {
    const data = c.req.valid('json');

    // Stats are bookkeeping: off the response path, and a failure there must
    // not fail a request whose quota is already spent.
    runAfterResponse(c, 'fingerprint.stats_failed', () =>
      recordUniquenessStats(data.data, c.env)
    );

    // Derive the ID from the submitted components instead of trusting the one
    // in the body: a reported ID is just a caller-supplied string, so echoing
    // it would let anyone claim any device.
    const fingerprintId = await computeFingerprintId(
      data.data as FingerprintData
    );
    const reportedIdMatches = data.fingerprintId === fingerprintId;

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
      quota_used: c.get('quotaUsed'),
      fingerprint_id: fingerprintId,
      reported_id_matches: reportedIdMatches,
      coverage_ratio: coverage.ratio,
      coverage_successful: coverage.successful,
      coverage_failed: coverage.failed,
      coverage_skipped: coverage.skipped,
    });

    return c.json({
      fingerprintId,
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
