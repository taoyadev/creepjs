import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { createTestEnv } from './utils';

describe('API Health Check', () => {
  it('should return health status', async () => {
    const req = new Request('http://localhost/', {
      method: 'GET',
    });

    const env = createTestEnv();

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('service', 'creepjs-api');
    expect(json).toHaveProperty('version', '1.0.0');
    expect(json).toHaveProperty('time');
  });

  it('should return versioned health status', async () => {
    const req = new Request('http://localhost/v1/health', {
      method: 'GET',
    });

    const env = createTestEnv();

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(json).toMatchObject({
      status: 'ok',
      service: 'creepjs-api',
      version: '1.0.0',
      route: '/v1/health',
    });
    expect(json).toHaveProperty('time');
  });

  it('should return 404 for unknown routes', async () => {
    const req = new Request('http://localhost/unknown', {
      method: 'GET',
    });

    const env = createTestEnv();

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(json).toHaveProperty('error', 'Not found');
  });
});
