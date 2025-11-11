import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { createTestEnv, seedToken } from './utils';

const basePayload = {
  fingerprintId: 'fpr_123',
  data: {},
  timestamp: 1700000000000,
  confidence: 0.9,
};

describe('Fingerprint route', () => {
  it('accepts valid submissions with a known token', async () => {
    const env = createTestEnv();
    const token = 'cfp_test_token';
    await seedToken(env, token, {
      email: 'fingerprint@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const req = new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': token,
      },
      body: JSON.stringify(basePayload),
    });

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      fingerprintId: 'fpr_123',
      confidence: 0.9,
    });

    const storedToken = await env.TOKENS.get(token, 'json');
    expect(storedToken.usageCount).toBe(1);

    const rateLimitEntry = await env.RATE_LIMIT.get(
      `ratelimit:${token}`,
      'json'
    );
    expect(rateLimitEntry.count).toBe(1);
  });

  it('rejects requests with missing or invalid tokens', async () => {
    const env = createTestEnv();
    const req = new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(basePayload),
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Missing API token');
  });
});
