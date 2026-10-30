import { describe, expect, it } from 'vitest';
import type { FingerprintData, FingerprintResult } from '@creepjs/core';
import {
  SIGNAL_ROWS,
  describeCoverage,
  describeRenderer,
  describeScanHeadline,
  describeUserAgent,
  fingerprintGlyph,
  formatDuration,
} from './fingerprint-summary';

const read = (data: FingerprintData) =>
  Object.fromEntries(SIGNAL_ROWS.map((row) => [row.key, row.read(data)]));

function result(
  coverage: Omit<FingerprintResult['coverage'], 'ratio'>,
  total = 1420
): FingerprintResult {
  return {
    fingerprintId: 'id',
    data: {},
    timestamp: 1,
    confidence: 1,
    coverage: { ratio: 1, ...coverage },
    timings: { total },
    collectors: {},
  };
}

describe('describeUserAgent', () => {
  it.each([
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Chrome 141 on macOS',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      'Edge 141 on Windows',
    ],
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
      'Firefox 132 on macOS',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Safari 18 on iOS',
    ],
    [
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
      'Chrome 141 on Android',
    ],
    [
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36',
      'Headless Chrome 141 on Linux',
    ],
  ])('reads %s', (userAgent, expected) => {
    expect(describeUserAgent(userAgent)).toBe(expected);
  });

  it('returns nothing for an empty or unrecognised user agent', () => {
    expect(describeUserAgent(undefined)).toBeNull();
    expect(describeUserAgent('curl/8.0')).toBeNull();
  });
});

describe('describeRenderer', () => {
  it.each([
    [
      'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
      'Apple M2',
    ],
    [
      'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002503) Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'NVIDIA GeForce RTX 3060',
    ],
    [
      'ANGLE (Intel, Mesa Intel(R) UHD Graphics 620 (KBL GT2), OpenGL 4.6)',
      'Mesa Intel(R) UHD Graphics 620 (KBL GT2)',
    ],
    [
      'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
      'Vulkan 1.3.0 (SwiftShader Device (Subzero))',
    ],
    ['Apple GPU', 'Apple GPU'],
    ['ANGLE (unexpected)', 'ANGLE (unexpected)'],
  ])('reads %s', (renderer, expected) => {
    expect(describeRenderer(renderer)).toBe(expected);
  });

  it('returns nothing without a renderer', () => {
    expect(describeRenderer(undefined)).toBeNull();
    expect(describeRenderer('')).toBeNull();
  });
});

describe('SIGNAL_ROWS', () => {
  it('reports zero and false as observed values, not as missing ones', () => {
    const rows = read({
      hardwareConcurrency: 0,
      lies: {
        hash: 'h',
        lies: {},
        liesCount: 0,
        trustScore: 100,
        inconsistencies: [],
      },
      webrtc: {
        hash: 'h',
        supported: false,
        iceServers: { stunSupported: false, turnSupported: false },
        candidates: { local: [], public: [], ipv4: [], ipv6: [] },
        connection: {},
        capabilities: { audio: [], video: [] },
        mediaDevices: false,
        getUserMediaSupported: false,
        rtcPeerConnectionSupported: false,
        dataChannelSupported: false,
      },
    });

    expect(rows.hardware).toBe('0 logical cores');
    expect(rows.consistency).toBe('No inconsistencies observed');
    expect(rows.webrtc).toBe('Not supported');
  });

  it('marks rows without returned data as missing', () => {
    expect(Object.values(read({}))).toEqual(SIGNAL_ROWS.map(() => null));
  });

  it('separates gathered WebRTC candidates from revealed public addresses', () => {
    const webrtc = (local: string[], exposed: string[]) =>
      read({
        webrtc: { supported: true, candidates: { local, public: exposed } },
      } as unknown as FingerprintData).webrtc;

    expect(webrtc([], [])).toBe('No network addresses gathered');
    expect(webrtc(['candidate:1 1 udp host abc.local'], [])).toBe(
      'No public IP revealed'
    );
    expect(webrtc(['a', 'b'], ['203.0.113.10'])).toBe('Reveals 1 public IP');
  });

  it('summarises a typical desktop scan', () => {
    const rows = read({
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      },
      webgl: {
        renderer: 'WebKit WebGL',
        unmaskedRenderer:
          'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
      },
      screen: { width: 1440, height: 900, devicePixelRatio: 2 },
      hardwareConcurrency: 8,
      deviceMemory: 8,
      timezone: { timezone: 'Asia/Shanghai' },
      languages: [['en-US'], ['en-US', 'en', 'zh-CN', 'fr']],
      webrtc: {
        supported: true,
        candidates: { local: ['a', 'b'], public: ['203.0.113.10', 'x'] },
      },
      lies: { liesCount: 2 },
    } as unknown as FingerprintData);

    expect(rows).toEqual({
      browser: 'Chrome 141 on macOS',
      graphics: 'Apple M2',
      screen: '1440 × 900, 2x pixel ratio',
      hardware: '8 logical cores, 8 GB memory',
      timezone: 'Asia/Shanghai',
      languages: 'en-US, en, zh-CN +1',
      webrtc: 'Reveals 2 public IPs',
      consistency: '2 inconsistencies observed',
    });
  });
});

describe('scan coverage copy', () => {
  it('treats unavailable APIs as normal and failed checks as qualifying', () => {
    const complete = result({ successful: 58, failed: 0, skipped: 0 });
    const unavailable = result({ successful: 52, failed: 0, skipped: 6 }, 640);
    const failing = result({ successful: 55, failed: 2, skipped: 1 });
    const empty = result({ successful: 0, failed: 3, skipped: 55 });

    expect(describeScanHeadline(complete)).toBe('Scan complete');
    expect(describeCoverage(complete)).toBe(
      'All 58 checks returned values in 1.4 s.'
    );
    expect(describeScanHeadline(unavailable)).toBe('Scan complete');
    expect(describeCoverage(unavailable)).toBe(
      '52 of 58 checks returned values in 640 ms. 6 are not available in this browser.'
    );
    expect(describeScanHeadline(failing)).toBe(
      'Scan finished with failed checks'
    );
    expect(describeCoverage(failing)).toBe(
      '55 of 58 checks returned values in 1.4 s. 2 failed and 1 is not available in this browser.'
    );
    expect(describeScanHeadline(empty)).toBe('No values returned');
    expect(describeCoverage(empty)).toContain('None of the 58 checks');
  });

  it('formats durations below and above one second', () => {
    expect(formatDuration(undefined)).toBe('0 ms');
    expect(formatDuration(999.4)).toBe('999 ms');
    expect(formatDuration(999.6)).toBe('1.0 s');
    expect(formatDuration(1050)).toBe('1.1 s');
  });
});

describe('fingerprintGlyph', () => {
  it('draws the same mark for the same ID and a different one for another ID', () => {
    expect(fingerprintGlyph('3kZ9xQ7aB2cD4eF6gH8iJ0')).toEqual(
      fingerprintGlyph('3kZ9xQ7aB2cD4eF6gH8iJ0')
    );
    expect(fingerprintGlyph('3kZ9xQ7aB2cD4eF6gH8iJ0')).not.toEqual(
      fingerprintGlyph('Zq81mN0pLk2Jh3Gf4Ds5Aa')
    );
  });

  it('uses one neutral arc per ring while no ID exists', () => {
    for (const ring of fingerprintGlyph(null)) {
      const [dash, gap] = ring.dash.split(' ').map(Number);
      expect(dash / (dash + gap)).toBeCloseTo(0.62, 2);
    }
  });

  it('keeps every dash pattern a whole number of repeats around its ring', () => {
    for (const ring of fingerprintGlyph('3kZ9xQ7aB2cD4eF6gH8iJ0')) {
      const [dash, gap] = ring.dash.split(' ').map(Number);
      const repeats = (2 * Math.PI * ring.radius) / (dash + gap);
      expect(Math.abs(repeats - Math.round(repeats))).toBeLessThan(0.01);
      expect([1, 2, 3]).toContain(Math.round(repeats));
    }
  });
});
