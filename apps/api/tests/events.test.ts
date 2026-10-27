import { describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENTS,
  ANALYTICS_PROP_RULES,
  type AnalyticsPropName,
} from '@creepjs/core/analytics-events';
import app from '../src/index';
import type { Env } from '../src/types';
import { createTestEnv } from './utils';

const SITE = 'https://creepjs.org';
const CLIENT_IP = '203.0.113.77';
const USER_AGENT = 'Mozilla/5.0 (EventsTest) Chrome/130.0';

const createDataset = () => {
  const points: AnalyticsEngineDataPoint[] = [];
  const dataset = {
    writeDataPoint: vi.fn((point?: AnalyticsEngineDataPoint) => {
      if (point) points.push(point);
    }),
  } as AnalyticsEngineDataset;
  return { dataset, points };
};

const productionEnv = (bindings: Partial<Env['Bindings']> = {}) =>
  createTestEnv({
    bindings: { ENVIRONMENT: 'production', CORS_ORIGIN: SITE, ...bindings },
  });

const postEvent = (
  env: Env['Bindings'],
  body: unknown,
  {
    origin = SITE,
    contentType = 'text/plain;charset=UTF-8',
  }: { origin?: string | null; contentType?: string } = {}
) => {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'CF-Connecting-IP': CLIENT_IP,
    'User-Agent': USER_AGENT,
  };
  if (origin) headers.Origin = origin;
  return app.fetch(
    new Request('http://localhost/v1/events', {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env
  );
};

const toolRun = {
  name: 'tool_run',
  path: '/checker',
  props: { tool: 'fingerprint_scan', surface: 'checker', outcome: 'success' },
};

describe('POST /v1/events', () => {
  it('stores a text/plain beacon as one data point with fixed columns', async () => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), toolRun);

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(points).toEqual([
      {
        indexes: ['tool_run'],
        blobs: [
          'tool_run',
          '/checker',
          'fingerprint_scan',
          'checker',
          'success',
          '',
          '',
          '',
        ],
        doubles: [1],
      },
    ]);
  });

  it('accepts application/json too', async () => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), toolRun, {
      contentType: 'application/json',
    });

    expect(res.status).toBe(204);
    expect(points).toHaveLength(1);
  });

  it('never stores the IP, user agent, query string or identifying props', async () => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), {
      name: 'tool_run',
      path: `https://creepjs.org/ip?q=${CLIENT_IP}#token=cfp_secret`,
      props: {
        tool: 'ip_lookup',
        surface: 'ip',
        outcome: 'success',
        status: '200',
        fingerprintId: '4iXmnUsPSGNp2NAvM5kksr',
        email: 'someone@example.com',
        ip: CLIENT_IP,
      },
    });

    expect(res.status).toBe(204);
    expect(points[0].blobs).toEqual([
      'tool_run',
      '/ip',
      'ip_lookup',
      'ip',
      'success',
      '200',
      '',
      '',
    ]);
    const stored = JSON.stringify(points);
    for (const secret of [
      CLIENT_IP,
      USER_AGENT,
      '4iXmnUsPSGNp2NAvM5kksr',
      'someone@example.com',
      'cfp_secret',
    ]) {
      expect(stored).not.toContain(secret);
    }
  });

  it('accepts every event in the shared allowlist', async () => {
    const sample = (prop: AnalyticsPropName): string => {
      const rule = ANALYTICS_PROP_RULES[prop];
      if (rule === 'slug') return 'checker';
      if (rule === 'status') return '200';
      return rule[0];
    };

    for (const name of ANALYTICS_EVENT_NAMES) {
      const { dataset, points } = createDataset();
      const props = Object.fromEntries(
        ANALYTICS_EVENTS[name].required.map((prop) => [prop, sample(prop)])
      );
      const res = await postEvent(productionEnv({ EVENTS: dataset }), {
        name,
        path: '/',
        props,
      });

      expect(res.status, name).toBe(204);
      expect(points[0].indexes, name).toEqual([name]);
    }
  });

  it.each([
    ['an unknown event', { ...toolRun, name: 'page_scraped' }],
    [
      'an out-of-enum prop',
      { ...toolRun, props: { ...toolRun.props, tool: 'port_scan' } },
    ],
    [
      'a free-text slug',
      { ...toolRun, props: { ...toolRun.props, surface: 'Hello World!' } },
    ],
    [
      'a missing required prop',
      { name: 'tool_run', path: '/', props: { tool: 'ip_lookup' } },
    ],
    ['an over-long path', { ...toolRun, path: `/${'a'.repeat(200)}` }],
  ])('rejects %s with 400 and writes nothing', async (_label, body) => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), body);

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'Invalid event' });
    expect(points).toHaveLength(0);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await postEvent(productionEnv(), '{"name":');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON' });
  });

  it.each([
    ['a foreign origin', 'https://third-party.example'],
    ['no origin', null],
  ])('rejects %s with 403', async (_label, origin) => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), toolRun, {
      origin,
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Origin not allowed' });
    expect(points).toHaveLength(0);
  });

  it('rejects other content types with 415', async () => {
    const res = await postEvent(productionEnv(), toolRun, {
      contentType: 'application/x-www-form-urlencoded',
    });
    expect(res.status).toBe(415);
  });

  it('rejects a body over 1 KiB with 413 before parsing it', async () => {
    const { dataset, points } = createDataset();
    const res = await postEvent(productionEnv({ EVENTS: dataset }), {
      ...toolRun,
      padding: 'x'.repeat(2048),
    });

    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Event too large' });
    expect(points).toHaveLength(0);
  });

  it('accepts and drops events when the binding is absent', async () => {
    const res = await postEvent(productionEnv({ EVENTS: undefined }), toolRun);
    expect(res.status).toBe(204);
  });

  it('still answers 204 when the dataset write throws', async () => {
    const dataset = {
      writeDataPoint: () => {
        throw new Error('dataset unavailable');
      },
    } as AnalyticsEngineDataset;
    const res = await postEvent(productionEnv({ EVENTS: dataset }), toolRun);
    expect(res.status).toBe(204);
  });

  it('touches no KV namespace or Durable Object', async () => {
    const forbidden = (binding: string) =>
      new Proxy(
        {},
        {
          get() {
            throw new Error(`/v1/events touched ${binding}`);
          },
        }
      );
    const { dataset, points } = createDataset();
    const env = productionEnv({
      EVENTS: dataset,
      TOKENS: forbidden('TOKENS') as KVNamespace,
      RATE_LIMIT: forbidden('RATE_LIMIT') as KVNamespace,
      IP_CACHE: forbidden('IP_CACHE') as KVNamespace,
      FP_STATS: forbidden('FP_STATS') as KVNamespace,
      QUOTA: forbidden('QUOTA') as DurableObjectNamespace,
      STATS: forbidden('STATS') as DurableObjectNamespace,
    });

    const res = await postEvent(env, toolRun);
    expect(res.status).toBe(204);
    expect(points).toHaveLength(1);
  });

  it('answers CORS preflights for the site origin only', async () => {
    const preflight = (origin: string) =>
      app.fetch(
        new Request('http://localhost/v1/events', {
          method: 'OPTIONS',
          headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'POST',
          },
        }),
        productionEnv()
      );

    expect(
      (await preflight(SITE)).headers.get('Access-Control-Allow-Origin')
    ).toBe(SITE);
    expect(
      (await preflight('https://third-party.example')).headers.get(
        'Access-Control-Allow-Origin'
      )
    ).toBeNull();
  });
});
