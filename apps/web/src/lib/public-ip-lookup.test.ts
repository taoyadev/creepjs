import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api-client';
import {
  IpInputError,
  isValidIpLiteral,
  lookupPublicIp,
  publicIpLookupErrorMessage,
} from './public-ip-lookup';

describe('public IP lookup boundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts valid IPv4 and IPv6 literals', () => {
    expect(isValidIpLiteral('8.8.8.8')).toBe(true);
    expect(isValidIpLiteral('2001:4860:4860::8888')).toBe(true);
    expect(isValidIpLiteral('::1')).toBe(true);
    expect(isValidIpLiteral('fe80::1%eth0')).toBe(true);
  });

  it('rejects malformed and non-literal input', () => {
    expect(isValidIpLiteral('999.8.8.8')).toBe(false);
    expect(isValidIpLiteral('1:2')).toBe(false);
    expect(isValidIpLiteral(':::')).toBe(false);
    expect(isValidIpLiteral('example.com')).toBe(false);
    expect(isValidIpLiteral('')).toBe(false);
  });

  it('uses privacy-safe, status-specific error copy', () => {
    expect(publicIpLookupErrorMessage(new IpInputError())).toBe(
      'Enter a valid IPv4 or IPv6 address.'
    );
    expect(
      publicIpLookupErrorMessage(
        new ApiError('Rate limit exceeded for 8.8.8.8', 429, null, 30)
      )
    ).toBe('Free lookup limit reached. Try again in 30 seconds.');
    expect(publicIpLookupErrorMessage(new ApiError('provider body', 503))).toBe(
      'IP intelligence is temporarily unavailable. Try again shortly.'
    );
  });

  it('trims and encodes a valid literal for the public endpoint', async () => {
    const response = {
      data: { ip: '2001:4860:4860::8888' },
      cached: false,
      highRisk: false,
      rateLimit: { limit: 30, remaining: 29, reset: null, tier: 'public' },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(lookupPublicIp(' 2001:4860:4860::8888 ')).resolves.toEqual(
      response
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.creepjs.org/v1/ip/public/2001%3A4860%3A4860%3A%3A8888'
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { Accept: 'application/json' },
    });
  });

  it('rejects invalid input without making a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(lookupPublicIp('not-an-ip')).rejects.toBeInstanceOf(
      IpInputError
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
