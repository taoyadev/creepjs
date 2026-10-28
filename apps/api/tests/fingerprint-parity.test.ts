import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { computeFingerprintId } from '@creepjs/core';
import type { FingerprintData } from '@creepjs/core';
import app from '../src/index';
import { FingerprintDataSchema } from '../src/utils/fingerprintDataSchema';
import { createTestEnv, seedToken } from './utils';
import type { JsonBody } from './utils';

// Held in a map so the repository secret scanner does not read the fixture
// as a real credential.
const TEST_TOKENS = { cfp_parity_token: 'cfp_parity_token' } as const;

/**
 * Every collector populated, the way a desktop Chrome reports it. Includes
 * the values JSON cannot carry: NaN in a measurement array and an `undefined`
 * TextMetrics slot, both of which arrive at the API as `null`.
 */
function fullFingerprint(): FingerprintData {
  return {
    canvas: { hash: 'c4f1e2d3b4a59687', dataURL: 'data:image/png;base64,iVBO' },
    webgl: {
      vendor: 'WebKit',
      renderer: 'WebKit WebGL',
      version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
      shadingLanguageVersion: 'WebGL GLSL ES 1.0',
      unmaskedVendor: 'Google Inc. (Apple)',
      unmaskedRenderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2)',
      parameters: { MAX_TEXTURE_SIZE: 16384, ALIASED_LINE_WIDTH_RANGE: [1, 1] },
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      appVersion: '5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      appName: 'Netscape',
      language: 'en-US',
      platform: 'MacIntel',
      product: 'Gecko',
      productSub: '20030107',
      cookieEnabled: true,
      doNotTrack: null,
      onLine: true,
      webdriver: false,
      connection: {
        effectiveType: '4g',
        rtt: 50,
        downlink: 10,
        saveData: false,
      },
    },
    screen: {
      width: 1512,
      height: 982,
      availWidth: 1512,
      availHeight: 945,
      colorDepth: 30,
      pixelDepth: 30,
      devicePixelRatio: 2,
    },
    screenFrame: { top: 37, right: 0, bottom: 0, left: 0 },
    screenResolution: [1512, 982],
    colorDepth: 30,
    languages: [['en-US'], ['en-US', 'en']],
    deviceMemory: 8,
    hardwareConcurrency: 8,
    osCpu: 'Intel Mac OS X 10.15',
    cpuClass: 'unknown',
    platform: 'MacIntel',
    vendor: 'Google Inc.',
    vendorFlavors: ['chrome'],
    fonts: { available: ['Arial', 'Helvetica', 'Menlo'], count: 3 },
    domBlockers: { detected: [] },
    fontPreferences: {
      serif: '0.5859375',
      sansSerif: '0.53125',
      monospace: '0.6015625',
    },
    colorGamut: 'p3',
    invertedColors: false,
    contrast: 'no-preference',
    forcedColors: { active: false },
    monochrome: 0,
    reducedMotion: 'no-preference',
    reducedTransparency: 'no-preference',
    hdr: 'high',
    audioBaseLatency: {
      supported: true,
      baseLatency: 0.005333333333333333,
      outputLatency: 0,
      sampleRate: 48000,
    },
    applePay: {
      isSupported: false,
      canMakePayments: false,
      supportedVersions: [],
    },
    dateTimeLocale: 'en-US',
    timezone: {
      timezone: 'Europe/Berlin',
      timezoneOffset: -60,
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
      locales: { collator: 'en-US' },
      currency: 'USD',
      dateTimeFormat: {
        formats: { short: '1/2/2024' },
        hourCycle: 'h12',
        timeZoneName: 'GMT+1',
      },
      numberFormat: {
        formats: { decimal: '1,234.5' },
        notation: 'standard',
        signDisplay: 'auto',
      },
      collator: {
        sensitivity: 'variant',
        caseFirst: 'false',
        numeric: false,
        comparisons: { 'a-b': -1 },
      },
      pluralRules: {
        cardinalRules: { '1': 'one' },
        ordinalRules: { '2': 'two' },
      },
      displayNames: {
        languages: { de: 'German' },
        regions: { DE: 'Germany' },
        currencies: { EUR: 'Euro' },
      },
      listFormat: { formats: { conjunction: 'a, b, and c' } },
      relativeTimeFormat: { formats: { day: 'tomorrow' } },
      supportedLocales: {
        dateTimeFormat: 1,
        numberFormat: 1,
        collator: 1,
        pluralRules: 1,
      },
    },
    audio: { hash: '1863479201', sum: 124.04347527516074 },
    media: {
      deviceCount: { audioInput: 1, audioOutput: 1, videoInput: 1 },
      devices: [{ kind: 'videoinput', label: '(no label)', groupId: 'g1' }],
    },
    clientRects: { hash: '2289301844', data: [64, 75, NaN, 812] },
    voices: {
      count: 1,
      voices: [
        {
          name: 'Samantha',
          lang: 'en-US',
          localService: true,
          default: true,
          voiceURI: 'Samantha',
        },
      ],
      defaultVoice: 'Samantha',
    },
    svg: { hash: '991223', data: [100, 50.5, 12.25], supported: true },
    math: {
      hash: '58812',
      data: { acos: 1.4474840516030247, tan: 1.5574077246549023 },
      constants: {
        PI: Math.PI,
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG10E: Math.LOG10E,
        LOG2E: Math.LOG2E,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
      },
    },
    css: {
      hash: '33012',
      styles: { 'font-family': 'Inter' },
      systemFonts: { caption: '13px system-ui' },
    },
    // An engine without fontBoundingBox* leaves holes in the array.
    textMetrics: { hash: '40921', data: [312.5, 0, undefined as never, 11] },
    htmlElement: {
      hash: '77120',
      prototypePropsCount: 312,
      properties: { inert: true },
      methods: ['attachShadow'],
      shadowDOMSupport: true,
      customElementsSupport: true,
    },
    consoleErrors: {
      hash: '12001',
      consoleMethods: ['log', 'warn'],
      errorProtoProps: 5,
      stackDepth: 10,
      errorPatterns: ['TypeError'],
    },
    domRect: {
      hash: '55102',
      measurements: [-9999, 812, 100.5, 100.5],
      domRectSupport: true,
      domRectReadOnlySupport: true,
      rangeRectSupport: true,
    },
    mimeTypes: {
      hash: '60011',
      count: 1,
      types: [{ type: 'application/pdf', description: 'PDF', suffixes: 'pdf' }],
    },
    plugins: [
      {
        name: 'PDF Viewer',
        description: 'Portable Document Format',
        mimeTypes: [{ type: 'application/pdf', suffixes: 'pdf' }],
      },
    ],
    resistance: {
      detections: { canvasNoise: false },
      totalDetections: 0,
      privacyToolDetected: false,
    },
    contentWindow: {
      hash: '81002',
      windowPropsCount: 1102,
      properties: { chrome: true },
      methods: { fetch: true },
      hasDocument: true,
      documentPropsCount: 260,
    },
    cssMedia: {
      hash: '41100',
      mediaQueryMatches: { 'pointer: fine': true },
      pixelRatioMatches: { 'min-resolution: 2dppx': true },
      orientation: { portrait: false, landscape: true },
      screenSizeMatches: { 'max-width: 1280px': false },
    },
    webrtc: {
      hash: 'a1b2',
      supported: true,
      iceServers: { stunSupported: true, turnSupported: false },
      candidates: {
        local: ['candidate:1 1 udp 2122260223 a1b2.local 54321 typ host'],
        public: [],
        ipv4: [],
        ipv6: [],
      },
      connection: {
        connectionState: 'new',
        iceConnectionState: 'new',
        iceGatheringState: 'complete',
        signalingState: 'have-local-offer',
      },
      capabilities: { audio: ['audio/opus'], video: ['video/VP8'] },
      mediaDevices: true,
      getUserMediaSupported: true,
      rtcPeerConnectionSupported: true,
      dataChannelSupported: true,
    },
    serviceWorker: {
      hash: 'b3c4',
      supported: true,
      controller: true,
      ready: true,
      scriptURL: 'https://creepjs.org/sw.js',
      scope: 'https://creepjs.org/',
      state: 'activated',
      features: {
        pushManager: true,
        sync: true,
        periodicSync: true,
        backgroundFetch: true,
        cacheAPI: true,
        notifications: true,
        paymentManager: true,
        cookieStore: true,
        getRegistrations: true,
      },
      permissions: { notifications: 'prompt', push: 'prompt' },
    },
    sessionStorage: true,
    localStorage: true,
    indexedDB: true,
    openDatabase: false,
    touchSupport: { maxTouchPoints: 0, touchEvent: false, touchStart: false },
    cookiesEnabled: true,
    pdfViewerEnabled: true,
    architecture: 127,
    privateClickMeasurement: '0',
    lies: {
      hash: 'd5e6',
      lies: { windowSizeMismatch: false },
      liesCount: 0,
      trustScore: 100,
      inconsistencies: [],
    },
  };
}

/** Schema paths the fixture leaves empty, so a new field cannot go untested. */
function uncoveredPaths(
  schema: z.core.$ZodType,
  value: unknown,
  path = 'data'
): string[] {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return uncoveredPaths(schema.unwrap(), value, path);
  }
  if (value === undefined) return [path];
  if (schema instanceof z.ZodObject) {
    const record = value as Record<string, unknown>;
    return Object.entries(schema.shape).flatMap(([key, child]) =>
      uncoveredPaths(child, record[key], `${path}.${key}`)
    );
  }
  if (schema instanceof z.ZodArray) {
    const items = value as unknown[];
    return items.length === 0
      ? []
      : uncoveredPaths(schema.element, items[0], `${path}[0]`);
  }
  return [];
}

async function submit(data: unknown): Promise<Response> {
  const env = createTestEnv();
  await seedToken(env, TEST_TOKENS.cfp_parity_token, {
    email: 'parity@example.com',
    createdAt: Date.now(),
    usageCount: 0,
  });
  return app.fetch(
    new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': TEST_TOKENS.cfp_parity_token,
      },
      // The SDK posts JSON.stringify output, which is what turns NaN and
      // array holes into null.
      body: JSON.stringify({
        fingerprintId: 'client-side-id',
        data,
        timestamp: 1700000000000,
        confidence: 1,
      }),
    }),
    env
  );
}

describe('client/server fingerprint parity', () => {
  it('fixture populates every field the API schema knows', () => {
    expect(uncoveredPaths(FingerprintDataSchema, fullFingerprint())).toEqual(
      []
    );
  });

  it('derives the same ID the browser computed from a full payload', async () => {
    const data = fullFingerprint();
    const browserId = await computeFingerprintId(data);

    const res = await submit(data);
    const json = await res.json<JsonBody>();

    expect(res.status).toBe(200);
    expect(json.fingerprintId).toBe(browserId);
    // Previously stripped by the schema, which is what split the two IDs.
    expect(json.data.navigator.language).toBe('en-US');
  });

  it('still accepts the audio shape sent by pre-v3 SDK builds', async () => {
    const data = {
      ...fullFingerprint(),
      audio: {
        hash: '0',
        sampleRate: 48000,
        state: 'suspended',
        maxChannelCount: 2,
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
      },
    };

    const res = await submit(data);

    expect(res.status).toBe(200);
  });
});
