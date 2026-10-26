import { describe, it, expect } from 'vitest';
import type { FingerprintData } from '../src/types';
import {
  IDENTITY_SCHEMA_VERSION,
  computeFingerprintId,
  projectIdentityData,
} from '../src/utils/identity';

function baseData(): FingerprintData {
  return {
    canvas: { hash: 'canvas-hash', dataURL: 'data:image/png;base64,AAAA' },
    navigator: {
      userAgent: 'UA',
      appVersion: 'AV',
      appName: 'Netscape',
      language: 'en-US',
      platform: 'MacIntel',
      product: 'Gecko',
      productSub: '20030107',
      cookieEnabled: true,
      doNotTrack: null,
      onLine: true,
      connection: { effectiveType: '4g', rtt: 50, downlink: 10 },
    },
    screen: {
      width: 2560,
      height: 1440,
      availWidth: 2560,
      availHeight: 1400,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 2,
    },
    timezone: {
      timezone: 'Europe/Berlin',
      timezoneOffset: -60,
      locale: 'en-US',
    },
    audio: { hash: 'audio-hash', sum: 124.04347527516074 },
    clientRects: { hash: 'rects-hash', data: [64, 75, -9999, 812] },
    domRect: {
      hash: 'domrect-hash',
      measurements: [-9999, 812, 100.5, 100.5],
      domRectSupport: true,
      domRectReadOnlySupport: true,
      rangeRectSupport: true,
    },
    css: {
      hash: 'css-hash',
      styles: { 'font-family': 'Inter, sans-serif', 'line-height': '24px' },
      systemFonts: { caption: '13px system-ui' },
    },
    cssMedia: {
      hash: 'media-hash',
      mediaQueryMatches: {
        'prefers-color-scheme: dark': false,
        'prefers-color-scheme: light': true,
        'display-mode: browser': true,
        'display-mode: fullscreen': false,
        'pointer: fine': true,
        'prefers-reduced-motion: reduce': false,
      },
      pixelRatioMatches: { 'min-resolution: 2dppx': true },
      orientation: { portrait: false, landscape: true },
      screenSizeMatches: { 'max-width: 1280px': false },
    },
    webrtc: {
      hash: 'webrtc-hash',
      supported: true,
      iceServers: { stunSupported: true, turnSupported: false },
      candidates: {
        local: ['candidate:1 1 udp 2122260223 a1b2.local 54321 typ host'],
        public: ['203.0.113.7'],
        ipv4: ['203.0.113.7'],
        ipv6: [],
      },
      connection: { iceGatheringState: 'complete' },
      capabilities: { audio: ['audio/opus'], video: ['video/VP8'] },
      mediaDevices: true,
      getUserMediaSupported: true,
      rtcPeerConnectionSupported: true,
      dataChannelSupported: true,
    },
    serviceWorker: {
      hash: 'sw-hash',
      supported: true,
      controller: false,
      ready: false,
      features: {
        pushManager: true,
        sync: true,
        periodicSync: false,
        backgroundFetch: false,
        cacheAPI: true,
        notifications: true,
        paymentManager: false,
        cookieStore: true,
        getRegistrations: true,
      },
      permissions: { notifications: 'prompt', push: 'prompt' },
    },
    media: {
      deviceCount: { audioInput: 1, audioOutput: 1, videoInput: 1 },
      devices: [
        { kind: 'audioinput', label: '(no label)', groupId: 'g1' },
        { kind: 'audiooutput', label: '(no label)', groupId: 'g1' },
        { kind: 'videoinput', label: '(no label)', groupId: 'g2' },
      ],
    },
    voices: {
      count: 2,
      voices: [
        {
          name: 'Samantha',
          lang: 'en-US',
          localService: true,
          default: true,
          voiceURI: 'Samantha',
        },
        {
          name: 'Google US English',
          lang: 'en-US',
          localService: false,
          default: false,
          voiceURI: 'Google US English',
        },
      ],
      defaultVoice: 'Samantha',
    },
    resistance: {
      detections: { canvasNoise: false },
      totalDetections: 0,
      privacyToolDetected: false,
    },
    lies: {
      hash: 'lies-hash',
      lies: { windowSizeMismatch: false },
      liesCount: 0,
      trustScore: 100,
      inconsistencies: [],
    },
  } as FingerprintData;
}

describe('identity projection', () => {
  it('drops values that move without the device changing', () => {
    const projected = projectIdentityData(baseData()) as Record<
      string,
      Record<string, unknown>
    >;

    expect(projected.lies).toBeUndefined();
    expect(projected.resistance).toBeUndefined();
    expect(projected.navigator.connection).toBeUndefined();
    expect(projected.navigator.onLine).toBeUndefined();
    expect(projected.screen.devicePixelRatio).toBeUndefined();
    expect(projected.timezone.timezoneOffset).toBeUndefined();
    expect(projected.canvas.dataURL).toBeUndefined();
    expect(projected.clientRects).toBeUndefined();
    expect(projected.domRect.measurements).toBeUndefined();
    expect(projected.css).toEqual({
      systemFonts: { caption: '13px system-ui' },
    });
    expect(projected.webrtc.candidates).toBeUndefined();
    expect(projected.serviceWorker.permissions).toBeUndefined();
  });

  it('keeps the components that actually identify the device', () => {
    const projected = projectIdentityData(baseData()) as Record<
      string,
      Record<string, unknown>
    >;

    expect(projected.navigator.userAgent).toBe('UA');
    expect(projected.screen.width).toBe(2560);
    expect(projected.timezone.timezone).toBe('Europe/Berlin');
    expect(projected.canvas.hash).toBe('canvas-hash');
    expect(projected.audio.sum).toBe(124.04347527516074);
    expect(projected.webrtc.capabilities).toEqual({
      audio: ['audio/opus'],
      video: ['video/VP8'],
    });
    expect(projected.cssMedia).toEqual({
      mediaQueryMatches: {
        'pointer: fine': true,
        'prefers-reduced-motion: reduce': false,
      },
    });
    expect(projected.media).toEqual({
      audioInput: true,
      audioOutput: true,
      videoInput: true,
    });
    expect(projected.voices).toEqual([
      expect.objectContaining({ name: 'Samantha' }),
    ]);
  });

  it('does not mutate the caller data', () => {
    const data = baseData();
    projectIdentityData(data);
    expect(data.lies).toBeDefined();
    expect(data.canvas?.dataURL).toBeDefined();
    expect(data.navigator?.connection).toBeDefined();
  });

  it('holds the ID steady across a network change', async () => {
    const before = baseData();
    const after = baseData();
    after.navigator!.connection = {
      effectiveType: '3g',
      rtt: 300,
      downlink: 1,
    };
    after.navigator!.onLine = false;

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady across zoom and a DST shift', async () => {
    const before = baseData();
    const after = baseData();
    after.screen!.devicePixelRatio = 1.5;
    after.timezone!.timezoneOffset = -120;
    after.cssMedia!.pixelRatioMatches = { 'min-resolution: 2dppx': false };
    after.clientRects!.data = [63.984375, 75.0078125, -9999, 812];
    after.domRect!.measurements = [-9999, 812, 100.49999237060547, 100.5];

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady across a resize, scroll and fullscreen', async () => {
    const before = baseData();
    const after = baseData();
    after.cssMedia!.orientation = { portrait: true, landscape: false };
    after.cssMedia!.screenSizeMatches = { 'max-width: 1280px': true };
    after.cssMedia!.mediaQueryMatches['display-mode: fullscreen'] = true;
    after.cssMedia!.mediaQueryMatches['display-mode: browser'] = false;
    after.clientRects!.data = [64, 75, -9999, 2400];
    after.domRect!.measurements = [-9999, 2400, 100.5, 100.5];

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady when the OS switches to dark mode', async () => {
    const before = baseData();
    const after = baseData();
    after.cssMedia!.mediaQueryMatches['prefers-color-scheme: dark'] = true;
    after.cssMedia!.mediaQueryMatches['prefers-color-scheme: light'] = false;

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady across fresh WebRTC ICE candidates', async () => {
    const before = baseData();
    const after = baseData();
    after.webrtc!.candidates = {
      local: ['candidate:1 1 udp 2122260223 f9e8.local 61001 typ host'],
      public: [],
      ipv4: [],
      ipv6: [],
    };
    after.webrtc!.iceServers.stunSupported = false;
    after.webrtc!.connection = { iceGatheringState: 'gathering' };
    after.webrtc!.hash = 'another-webrtc-hash';

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady after camera and notification grants', async () => {
    const before = baseData();
    const after = baseData();
    after.media = {
      deviceCount: { audioInput: 3, audioOutput: 2, videoInput: 2 },
      devices: [
        { kind: 'audioinput', label: 'MacBook Pro Microphone', groupId: 'x1' },
        { kind: 'audioinput', label: 'AirPods', groupId: 'x2' },
        { kind: 'audioinput', label: 'Studio Display', groupId: 'x3' },
        { kind: 'audiooutput', label: 'MacBook Pro Speakers', groupId: 'x1' },
        { kind: 'audiooutput', label: 'AirPods', groupId: 'x2' },
        { kind: 'videoinput', label: 'FaceTime HD Camera', groupId: 'x4' },
        { kind: 'videoinput', label: 'Studio Display Camera', groupId: 'x3' },
      ],
    };
    after.serviceWorker!.permissions = {
      notifications: 'granted',
      push: 'granted',
    };

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady on a different host page', async () => {
    const before = baseData();
    const after = baseData();
    after.css!.styles = { 'font-family': 'Georgia', 'line-height': '32px' };
    after.css!.hash = 'another-css-hash';
    after.serviceWorker!.controller = true;
    after.serviceWorker!.ready = true;
    after.serviceWorker!.scope = 'https://customer.example/';
    after.serviceWorker!.scriptURL = 'https://customer.example/sw.js';

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('holds the ID steady when network voices fail to load', async () => {
    const before = baseData();
    const after = baseData();
    after.voices = {
      count: 1,
      voices: before.voices!.voices.filter((voice) => voice.localService),
      defaultVoice: 'Samantha',
    };

    expect(await computeFingerprintId(after)).toBe(
      await computeFingerprintId(before)
    );
  });

  it('still separates genuinely different devices', async () => {
    const before = baseData();
    const after = baseData();
    after.canvas!.hash = 'a-different-canvas';

    expect(await computeFingerprintId(after)).not.toBe(
      await computeFingerprintId(before)
    );
  });

  it('separates devices by audio stack, installed voices and camera', async () => {
    const ids = new Set<string>();
    const base = baseData();
    ids.add(await computeFingerprintId(base));

    const audio = baseData();
    audio.audio!.sum = 124.08072766105033;
    ids.add(await computeFingerprintId(audio));

    const voices = baseData();
    voices.voices!.voices[0]!.name = 'Microsoft David';
    ids.add(await computeFingerprintId(voices));

    const noCamera = baseData();
    noCamera.media!.deviceCount.videoInput = 0;
    ids.add(await computeFingerprintId(noCamera));

    expect(ids.size).toBe(4);
  });

  it('changes every ID when the schema version moves', () => {
    // Guards the SDK cache epoch: the constant is part of the hash input, so a
    // bump must be deliberate.
    expect(IDENTITY_SCHEMA_VERSION).toBe(3);
  });
});
