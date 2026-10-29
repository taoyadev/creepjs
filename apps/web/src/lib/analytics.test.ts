import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const EVENTS_URL = 'https://api.creepjs.org/v1/events';

interface Env {
  sendBeacon?: ReturnType<typeof vi.fn>;
  doNotTrack?: string;
  globalPrivacyControl?: boolean;
  pathname?: string;
}

const cfBeaconRead = vi.fn();

function stubBrowser({
  sendBeacon,
  doNotTrack,
  globalPrivacyControl,
  pathname = '/ip',
}: Env = {}) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  const win = { location: { pathname } };
  Object.defineProperty(win, '__cfBeacon', {
    get: () => {
      cfBeaconRead();
      return undefined;
    },
  });
  vi.stubGlobal('window', win);
  vi.stubGlobal('navigator', {
    ...(sendBeacon ? { sendBeacon } : {}),
    doNotTrack,
    globalPrivacyControl,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function blobJson(blob: Blob) {
  return JSON.parse(await blob.text()) as unknown;
}

describe('trackEvent', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    cfBeaconRead.mockClear();
  });

  it('beacons a text/plain event to the API with only allowlisted props', async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    const fetchMock = stubBrowser({ sendBeacon, pathname: '/ip' });
    const { trackEvent } = await import('./analytics');

    trackEvent('tool_run', {
      tool: 'ip_lookup',
      surface: 'ip',
      outcome: 'success',
      status: '200',
      // Not allowlisted: must never leave the browser.
      ...({ fingerprintId: 'fp_123', email: 'user@example.com' } as object),
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0] as [string, Blob];
    expect(url).toBe(EVENTS_URL);
    expect(blob.type).toBe('text/plain');
    expect(await blobJson(blob)).toEqual({
      name: 'tool_run',
      path: '/ip',
      props: {
        tool: 'ip_lookup',
        surface: 'ip',
        outcome: 'success',
        status: '200',
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cfBeaconRead).not.toHaveBeenCalled();
  });

  it('drops a prop whose value breaks its rule and keeps the rest', async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    stubBrowser({ sendBeacon });
    const { trackEvent } = await import('./analytics');

    trackEvent('button_clicked', { label: 'Copy IP Result!', section: 'ip' });

    const [, blob] = sendBeacon.mock.calls[0] as [string, Blob];
    expect(await blobJson(blob)).toMatchObject({ props: { section: 'ip' } });
  });

  it.each([
    ['sendBeacon is unavailable', undefined],
    ['the beacon is refused', vi.fn().mockReturnValue(false)],
  ])('falls back to a keepalive fetch when %s', async (_label, sendBeacon) => {
    const fetchMock = stubBrowser({ sendBeacon });
    const { trackEvent } = await import('./analytics');

    trackEvent('fingerprint_copied', { surface: 'checker' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(EVENTS_URL);
    expect(init).toMatchObject({
      method: 'POST',
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'fingerprint_copied',
      path: '/ip',
      props: { surface: 'checker' },
    });
  });

  it.each([
    ['Do Not Track', { doNotTrack: '1' }],
    ['Global Privacy Control', { globalPrivacyControl: true }],
  ])('sends nothing under %s', async (_label, env) => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    const fetchMock = stubBrowser({ sendBeacon, ...env });
    const { trackEvent } = await import('./analytics');

    trackEvent('docs_viewed', { section: 'api' });
    trackEvent('partner_impression', {
      label: 'test-provider',
      section: 'partner-directory',
    });
    trackEvent('link_clicked', {
      label: 'test-provider',
      section: 'partner-directory',
    });

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends nothing outside production builds', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const sendBeacon = vi.fn().mockReturnValue(true);
    const fetchMock = stubBrowser({ sendBeacon });
    const { trackEvent } = await import('./analytics');

    trackEvent('docs_viewed', { section: 'api' });
    trackEvent('partner_impression', {
      label: 'test-provider',
      section: 'partner-directory',
    });
    trackEvent('link_clicked', {
      label: 'test-provider',
      section: 'partner-directory',
    });

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends only partner dimensions and strips IP query and fragment', async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    stubBrowser({ sendBeacon, pathname: '/ip?q=203.0.113.7#secret' });
    const { trackEvent } = await import('./analytics');
    trackEvent('partner_impression', {
      label: 'test-provider',
      section: 'partner-ip-result',
      ...({
        ip: '203.0.113.7',
        fingerprintId: 'test-fingerprint',
        risk: 99,
        coupon: 'TEST',
        url: 'https://provider.test',
      } as object),
    });
    const [, blob] = sendBeacon.mock.calls[0] as [string, Blob];
    expect(await blobJson(blob)).toEqual({
      name: 'partner_impression',
      path: '/ip',
      props: { label: 'test-provider', section: 'partner-ip-result' },
    });
  });

  it('keeps partner tracking best-effort when transport fails', async () => {
    const fetchMock = stubBrowser({
      sendBeacon: vi.fn().mockReturnValue(false),
    });
    fetchMock.mockRejectedValue(new Error('offline'));
    const { trackEvent } = await import('./analytics');
    expect(() =>
      trackEvent('link_clicked', {
        label: 'test-provider',
        section: 'partner-guide',
      })
    ).not.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await Promise.resolve();
  });

  it('does nothing on the server', async () => {
    const { trackEvent } = await import('./analytics');
    expect(() => trackEvent('docs_viewed', { section: 'api' })).not.toThrow();
  });
});
