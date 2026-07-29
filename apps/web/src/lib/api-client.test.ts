import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl, fetchJson } from './api-client';

describe('api-client', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('normalizes relative API paths and preserves absolute URLs', () => {
    expect(apiUrl('v1/health')).toBe('https://api.creepjs.org/v1/health');
    expect(apiUrl('/my-ip')).toBe('https://api.creepjs.org/my-ip');
    expect(apiUrl('https://example.com/data')).toBe('https://example.com/data');
  });

  it('retries one failed GET and returns the successful JSON body', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJson<{ ok: boolean }>('/v1/health')).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never replays a non-idempotent request even when retry is requested', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchJson('/v1/token', { method: 'POST', retry: true })
    ).rejects.toThrow('network down');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('exposes Retry-After on structured API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: {
            'content-type': 'application/json',
            'retry-after': '120',
          },
        })
      )
    );

    await expect(
      fetchJson('/v1/ip/batch', { method: 'POST' })
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
      retryAfter: 120,
    });
  });

  it('does not retry after the request timeout expires', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          );
        })
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchJson('/my-ip', { timeoutMs: 50 });
    const rejection = expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 408,
    });
    await vi.advanceTimersByTimeAsync(50);

    await rejection;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes an already-aborted caller signal through without retrying', async () => {
    const caller = new AbortController();
    caller.abort();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      expect(init?.signal?.aborted).toBe(true);
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchJson('/my-ip', { signal: caller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
