import { afterEach, describe, expect, it, vi } from 'vitest';

describe('analytics sanitization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('removes sensitive fields and normalizes URLs before tracking', async () => {
    const beacon = vi.fn();

    vi.stubGlobal('window', {
      __cfBeacon: beacon,
      location: { href: 'https://creepjs.org/docs?utm_source=test' },
    });

    const { trackEvent, trackPageView } = await import('./analytics');

    trackEvent('api_token_requested', {
      email: 'user@example.com',
      fingerprintId: 'fp_123',
      page: 'https://creepjs.org/playground?token=abc',
      linkUrl: 'https://creepjs.org/docs?email=user@example.com#api',
      buttonLabel: 'Generate Token',
    });
    trackPageView('https://creepjs.org/playground?token=abc#intro');

    expect(beacon).toHaveBeenNthCalledWith(1, 'track', 'api_token_requested', {
      page: '/playground',
      linkUrl: '/docs#api',
      buttonLabel: 'Generate Token',
    });
    expect(beacon).toHaveBeenNthCalledWith(2, 'trackPageview', {
      url: '/playground#intro',
    });
  });
});
