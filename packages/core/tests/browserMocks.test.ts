import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { collectWebRTCFingerprint } from '../src/collectors/webrtc';
import { collectServiceWorkerFingerprint } from '../src/collectors/serviceWorker';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var RTCPeerConnection: typeof FakeRTCPeerConnection | undefined;
}

class FakeRTCPeerConnection {
  public onicecandidate:
    | ((event: { candidate: { candidate: string } | null }) => void)
    | null = null;

  public onicegatheringstatechange: (() => void) | null = null;

  public iceGatheringState: 'gathering' | 'complete' = 'gathering';

  constructor(_config?: unknown) {}

  createDataChannel() {
    return {};
  }

  async createOffer() {
    return { type: 'offer', sdp: 'dummy' } as const;
  }

  async setLocalDescription() {
    setTimeout(() => {
      this.onicecandidate?.({
        candidate: {
          candidate:
            'candidate:1 1 udp 2122260223 203.0.113.1 3478 typ srflx' +
            ' raddr 10.0.0.2 rport 8998',
        },
      });
      this.iceGatheringState = 'complete';
      this.onicecandidate?.({ candidate: null });
      this.onicegatheringstatechange?.();
    }, 0);
  }

  close() {
    this.iceGatheringState = 'complete';
  }
}

describe('browser-mocked collectors', () => {
  const originalRTCPeerConnection = globalThis.RTCPeerConnection;
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalRTCPeerConnection) {
      globalThis.RTCPeerConnection = originalRTCPeerConnection;
    } else {
      // @ts-expect-error cleanup
      delete globalThis.RTCPeerConnection;
    }

    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('collectWebRTCFingerprint succeeds with mocked RTCPeerConnection', async () => {
    globalThis.RTCPeerConnection =
      FakeRTCPeerConnection as unknown as typeof globalThis.RTCPeerConnection;

    const mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(undefined),
    };

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        mediaDevices,
      },
    });

    const result = await collectWebRTCFingerprint();
    expect(result).toBeDefined();
    expect(result?.supported).toBe(true);
    expect(result?.candidates.local.length).toBeGreaterThan(0);
    expect(
      result?.candidates.public.length + result!.candidates.ipv4.length
    ).toBeGreaterThan(0);
  });

  it('collectServiceWorkerFingerprint resolves data when APIs exist', async () => {
    const readyPromise = Promise.resolve({
      scope: '/scope',
      active: { scriptURL: '/sw.js', state: 'activated' },
    });

    const fakeRegistration = {
      scope: '/scope',
      active: { scriptURL: '/sw.js', state: 'activated' },
    } as ServiceWorkerRegistration;

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        serviceWorker: {
          controller: { state: 'activated' },
          ready: readyPromise,
          getRegistrations: () => Promise.resolve([fakeRegistration]),
        },
        permissions: {
          query: vi.fn().mockResolvedValue({ state: 'granted' }),
        },
      },
    });

    class FakeServiceWorkerRegistration {}
    Object.defineProperty(globalThis, 'ServiceWorkerRegistration', {
      configurable: true,
      value: FakeServiceWorkerRegistration,
    });

    const result = await collectServiceWorkerFingerprint();
    expect(result).toBeDefined();
    expect(result?.supported).toBe(true);
    expect(result?.features).toMatchObject({ cacheAPI: false });
  });
});
