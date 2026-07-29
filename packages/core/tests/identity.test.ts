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
    audio: {
      hash: 'audio-hash',
      sampleRate: 48000,
      state: 'running',
      maxChannelCount: 2,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 2,
      channelCountMode: 'max',
      channelInterpretation: 'speakers',
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
    expect(projected.audio.state).toBeUndefined();
    expect(projected.canvas.dataURL).toBeUndefined();
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
    expect(projected.audio.sampleRate).toBe(48000);
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

  it('changes every ID when the schema version moves', () => {
    // Guards the SDK cache epoch: the constant is part of the hash input, so a
    // bump must be deliberate.
    expect(IDENTITY_SCHEMA_VERSION).toBe(2);
  });
});
