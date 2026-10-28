import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { collectWebRTCFingerprint } from '../src/collectors/webrtc';
import { collectServiceWorkerFingerprint } from '../src/collectors/serviceWorker';
import { collectVoicesFingerprint } from '../src/collectors/voices';
import { collectAudioFingerprint } from '../src/collectors/audio';
import { murmurHash3 } from '../src/utils/hash';

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
  // jsdom has no RTCPeerConnection; the DOM lib types say it always exists.
  const rtcGlobal = globalThis as { RTCPeerConnection?: unknown };
  const originalRTCPeerConnection = rtcGlobal.RTCPeerConnection;
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalRTCPeerConnection) {
      rtcGlobal.RTCPeerConnection = originalRTCPeerConnection;
    } else {
      delete rtcGlobal.RTCPeerConnection;
    }

    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('collectWebRTCFingerprint succeeds with mocked RTCPeerConnection', async () => {
    rtcGlobal.RTCPeerConnection = FakeRTCPeerConnection;

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
      result!.candidates.public.length + result!.candidates.ipv4.length
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

  describe('collectVoicesFingerprint', () => {
    class FakeSpeechSynthesis extends EventTarget {
      voices: Array<Partial<SpeechSynthesisVoice>> = [];
      onvoiceschanged: (() => void) | null = null;
      getVoices() {
        return this.voices;
      }
    }

    const localVoice = {
      name: 'Samantha',
      lang: 'en-US',
      localService: true,
      default: true,
      voiceURI: 'Samantha',
    };

    function installSynth(): FakeSpeechSynthesis {
      const synth = new FakeSpeechSynthesis();
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: synth,
      });
      return synth;
    }

    afterEach(() => {
      vi.useRealTimers();
      // @ts-expect-error cleanup
      delete window.speechSynthesis;
    });

    it('waits for voiceschanged without taking over the page handler', async () => {
      const synth = installSynth();
      const pageHandler = () => {};
      synth.onvoiceschanged = pageHandler;

      const pending = collectVoicesFingerprint();
      synth.voices = [localVoice];
      synth.dispatchEvent(new Event('voiceschanged'));

      const result = await pending;
      expect(result?.count).toBe(1);
      expect(result?.voices[0]?.name).toBe('Samantha');
      expect(synth.onvoiceschanged).toBe(pageHandler);
    });

    it('resolves instead of hanging when voiceschanged never fires', async () => {
      vi.useFakeTimers();
      installSynth();

      const pending = collectVoicesFingerprint();
      await vi.advanceTimersByTimeAsync(1000);

      await expect(pending).resolves.toBeUndefined();
    });
  });

  describe('collectAudioFingerprint', () => {
    function installOfflineAudioContext(samples: Float32Array) {
      const node = () => ({ connect: vi.fn() });
      const param = () => ({ value: 0 });

      class FakeOfflineAudioContext {
        destination = {};
        oncomplete: ((event: { renderedBuffer: unknown }) => void) | null =
          null;
        constructor(
          public channels: number,
          public length: number,
          public sampleRate: number
        ) {}
        createOscillator() {
          return {
            ...node(),
            type: 'sine',
            frequency: param(),
            start: vi.fn(),
          };
        }
        createDynamicsCompressor() {
          return {
            ...node(),
            threshold: param(),
            knee: param(),
            ratio: param(),
            attack: param(),
            release: param(),
          };
        }
        startRendering() {
          return Promise.resolve({ getChannelData: () => samples });
        }
      }

      Object.defineProperty(window, 'OfflineAudioContext', {
        configurable: true,
        value: FakeOfflineAudioContext,
      });
    }

    afterEach(() => {
      // @ts-expect-error cleanup
      delete window.OfflineAudioContext;
    });

    it('sums the rendered tail of an offline render', async () => {
      // Frames before 4500 are the compressor settling and must not count.
      const samples = new Float32Array(5000).fill(1);
      samples.fill(-0.5, 4500);
      installOfflineAudioContext(samples);

      const result = await collectAudioFingerprint();

      expect(result).toEqual({ hash: String(murmurHash3('250')), sum: 250 });
    });

    it('skips when the browser has no offline audio context', async () => {
      await expect(collectAudioFingerprint()).resolves.toBeUndefined();
    });
  });
});
