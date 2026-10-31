import { describe, expect, it } from 'vitest';
import app from '../src/index';
import {
  INQUIRY_LIMIT_PER_IP_PER_DAY,
  INQUIRY_TTL_SECONDS,
} from '../src/routes/sponsor-inquiries';
import { createMockKV, createTestEnv } from './utils';
import type { JsonBody } from './utils';

const SITE = 'https://creepjs.org';

const send = (
  env: ReturnType<typeof createTestEnv>,
  body: unknown,
  {
    origin = SITE,
    ip = '1.1.1.1',
  }: { origin?: string | null; ip?: string } = {}
) =>
  app.fetch(
    new Request('http://localhost/v1/sponsor-inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': ip,
        ...(origin ? { Origin: origin } : {}),
      },
      body: JSON.stringify(body),
    }),
    env
  );

const envWithStore = () => {
  const store = createMockKV();
  const puts: Array<{ key: string; ttl?: number }> = [];
  const put = store.put.bind(store);
  store.put = (async (
    key: string,
    value: string,
    options?: KVNamespacePutOptions
  ) => {
    puts.push({ key, ttl: options?.expirationTtl });
    return put(key, value, options);
  }) as KVNamespace['put'];
  const env = createTestEnv({
    bindings: {
      ENVIRONMENT: 'production',
      CORS_ORIGIN: SITE,
      SPONSOR_INQUIRIES: store,
    },
  });
  return { env, store, puts };
};

describe('Sponsor inquiry route', () => {
  it('stores the email and website with an expiry', async () => {
    const { env, store, puts } = envWithStore();
    const res = await send(env, {
      email: 'ads@vendor.example',
      website: 'https://vendor.example',
    });

    expect(res.status).toBe(202);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(SITE);
    expect(puts).toHaveLength(1);
    const [put] = puts as [{ key: string; ttl?: number }];
    expect(put.key).toMatch(/^inquiry:\d{4}-\d{2}-\d{2}T/);
    expect(put.ttl).toBe(INQUIRY_TTL_SECONDS);
    expect(await store.get<JsonBody>(put.key, 'json')).toMatchObject({
      email: 'ads@vendor.example',
      website: 'https://vendor.example',
    });
  });

  it('accepts an email alone', async () => {
    const { env, puts } = envWithStore();
    expect((await send(env, { email: 'ads@vendor.example' })).status).toBe(202);
    expect(puts).toHaveLength(1);
  });

  it.each([
    [{ email: 'not-an-email' }],
    [{ email: 'ads@vendor.example', website: 'javascript:alert(1)' }],
    [{ email: 'ads@vendor.example', extra: 'field' }],
  ])('rejects invalid bodies without storing: %j', async (body) => {
    const { env, puts } = envWithStore();
    const res = await send(env, body);
    expect(res.status).toBe(400);
    expect((await res.json<JsonBody>()).error).toBe('Invalid request body');
    expect(puts).toHaveLength(0);
  });

  it('refuses other origins and missing origins', async () => {
    const { env, puts } = envWithStore();
    for (const origin of ['https://third-party.example', null]) {
      const res = await send(env, { email: 'ads@vendor.example' }, { origin });
      expect(res.status).toBe(403);
    }
    expect(puts).toHaveLength(0);
  });

  it('answers 503 until the namespace is bound', async () => {
    const env = createTestEnv({
      bindings: { ENVIRONMENT: 'production', CORS_ORIGIN: SITE },
    });
    const res = await send(env, { email: 'ads@vendor.example' });
    expect(res.status).toBe(503);
  });

  it('limits inquiries per visitor per day', async () => {
    const { env, puts } = envWithStore();
    for (let i = 0; i < INQUIRY_LIMIT_PER_IP_PER_DAY; i++) {
      expect((await send(env, { email: `a${i}@vendor.example` })).status).toBe(
        202
      );
    }
    const res = await send(env, { email: 'late@vendor.example' });
    expect(res.status).toBe(429);
    expect(puts).toHaveLength(INQUIRY_LIMIT_PER_IP_PER_DAY);
    expect(
      (await send(env, { email: 'other@vendor.example' }, { ip: '2.2.2.2' }))
        .status
    ).toBe(202);
  });
});
