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
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('service', 'creepjs-api');
  });

  it('should return 404 for unknown routes', async () => {
    const req = new Request('http://localhost/unknown', {
      method: 'GET',
    });

    const env = createTestEnv();

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toHaveProperty('error', 'Not found');
  });
});
