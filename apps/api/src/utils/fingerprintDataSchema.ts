import { z } from 'zod';

const CanvasFingerprintSchema = z.object({
  hash: z.string(),
  dataURL: z.string().optional(),
});

const WebGLFingerprintSchema = z.object({
  vendor: z.string(),
  renderer: z.string(),
  version: z.string(),
  shadingLanguageVersion: z.string(),
  unmaskedVendor: z.string().optional(),
  unmaskedRenderer: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
});

const NavigatorFingerprintSchema = z.object({
  userAgent: z.string(),
  appVersion: z.string(),
  appName: z.string(),
  platform: z.string(),
  product: z.string(),
  productSub: z.string(),
  cookieEnabled: z.boolean(),
  doNotTrack: z.string().nullable(),
  onLine: z.boolean(),
  webdriver: z.boolean().optional(),
  connection: z
    .object({
      effectiveType: z.string().optional(),
      rtt: z.number().optional(),
      downlink: z.number().optional(),
      saveData: z.boolean().optional(),
    })
    .optional(),
});

const ScreenFingerprintSchema = z.object({
  width: z.number(),
  height: z.number(),
  availWidth: z.number(),
  availHeight: z.number(),
  colorDepth: z.number(),
  pixelDepth: z.number(),
  devicePixelRatio: z.number(),
});

const ScreenFrameFingerprintSchema = z.object({
  top: z.number().nullable(),
  right: z.number().nullable(),
  bottom: z.number().nullable(),
  left: z.number().nullable(),
});

const ScreenResolutionFingerprintSchema = z.tuple([
  z.number().nullable(),
  z.number().nullable(),
]);

const LanguagesFingerprintSchema = z.array(z.array(z.string()));

const FontsFingerprintSchema = z.object({
  available: z.array(z.string()),
  count: z.number(),
});

const DomBlockerFingerprintSchema = z.object({
  detected: z.array(z.string()),
});

const FontPreferencesFingerprintSchema = z.object({
  serif: z.string().optional(),
  sansSerif: z.string().optional(),
  monospace: z.string().optional(),
});

const AudioBaseLatencyFingerprintSchema = z.object({
  supported: z.boolean(),
  baseLatency: z.number().optional(),
  outputLatency: z.number().optional(),
  sampleRate: z.number().optional(),
});

const ApplePayFingerprintSchema = z.object({
  isSupported: z.boolean(),
  canMakePayments: z.boolean().optional(),
  supportedVersions: z.array(z.number()).optional(),
});

const RelativeFormatsSchema = z.object({
  formats: z.record(z.string()),
});

const TimezoneFingerprintSchema = z.object({
  timezone: z.string(),
  timezoneOffset: z.number(),
  locale: z.string(),
  calendar: z.string().optional(),
  numberingSystem: z.string().optional(),
  locales: z.record(z.unknown()).optional(),
  currency: z.string().optional(),
  dateTimeFormat: z
    .object({
      formats: z.record(z.string()),
      hourCycle: z.string().optional(),
      timeZoneName: z.string().optional(),
    })
    .optional(),
  numberFormat: z
    .object({
      formats: z.record(z.string()),
      notation: z.string().optional(),
      signDisplay: z.string().optional(),
    })
    .optional(),
  collator: z
    .object({
      sensitivity: z.string().optional(),
      caseFirst: z.string().optional(),
      numeric: z.boolean().optional(),
      comparisons: z.record(z.number()),
    })
    .optional(),
  pluralRules: z
    .object({
      cardinalRules: z.record(z.string()),
      ordinalRules: z.record(z.string()),
    })
    .optional(),
  displayNames: z
    .object({
      languages: z.record(z.string()),
      regions: z.record(z.string()),
      currencies: z.record(z.string()),
    })
    .optional(),
  listFormat: RelativeFormatsSchema.optional(),
  relativeTimeFormat: RelativeFormatsSchema.optional(),
  supportedLocales: z
    .object({
      dateTimeFormat: z.number(),
      numberFormat: z.number(),
      collator: z.number(),
      pluralRules: z.number(),
    })
    .optional(),
});

const AudioFingerprintSchema = z.object({
  hash: z.string(),
  sampleRate: z.number(),
  state: z.string(),
  maxChannelCount: z.number(),
  numberOfInputs: z.number(),
  numberOfOutputs: z.number(),
  channelCount: z.number(),
  channelCountMode: z.string(),
  channelInterpretation: z.string(),
});

const MediaDevicesFingerprintSchema = z.object({
  deviceCount: z.object({
    audioInput: z.number(),
    audioOutput: z.number(),
    videoInput: z.number(),
  }),
  devices: z.array(
    z.object({
      kind: z.string(),
      label: z.string(),
      groupId: z.string(),
    })
  ),
});

const ClientRectsFingerprintSchema = z.object({
  hash: z.string(),
  data: z.array(z.number()),
});

const VoicesFingerprintSchema = z.object({
  count: z.number(),
  voices: z.array(
    z.object({
      name: z.string(),
      lang: z.string(),
      localService: z.boolean(),
      default: z.boolean(),
      voiceURI: z.string(),
    })
  ),
  defaultVoice: z.string().optional(),
});

const SVGFingerprintSchema = z.object({
  hash: z.string(),
  data: z.array(z.number()),
  supported: z.boolean(),
});

const MathFingerprintSchema = z.object({
  hash: z.string(),
  data: z.record(z.number()),
  constants: z.object({
    PI: z.number(),
    E: z.number(),
    LN10: z.number(),
    LN2: z.number(),
    LOG10E: z.number(),
    LOG2E: z.number(),
    SQRT1_2: z.number(),
    SQRT2: z.number(),
  }),
});

const CSSFingerprintSchema = z.object({
  hash: z.string(),
  styles: z.record(z.string()),
  systemFonts: z.record(z.string()),
});

const TextMetricsFingerprintSchema = z.object({
  hash: z.string(),
  data: z.array(z.number()),
});

const HTMLElementFingerprintSchema = z.object({
  hash: z.string(),
  prototypePropsCount: z.number(),
  properties: z.record(z.unknown()),
  methods: z.array(z.string()),
  shadowDOMSupport: z.boolean(),
  customElementsSupport: z.boolean(),
});

const ConsoleErrorsFingerprintSchema = z.object({
  hash: z.string(),
  consoleMethods: z.array(z.string()),
  errorProtoProps: z.number(),
  stackDepth: z.number(),
  errorPatterns: z.array(z.string()),
});

const DomRectFingerprintSchema = z.object({
  hash: z.string(),
  measurements: z.array(z.number()),
  domRectSupport: z.boolean(),
  domRectReadOnlySupport: z.boolean(),
  rangeRectSupport: z.boolean(),
});

const MimeTypesFingerprintSchema = z.object({
  hash: z.string(),
  count: z.number(),
  types: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      suffixes: z.string(),
    })
  ),
});

const PluginFingerprintSchema = z.object({
  name: z.string(),
  description: z.string(),
  mimeTypes: z.array(
    z.object({
      type: z.string(),
      suffixes: z.string(),
    })
  ),
});

const ResistanceFingerprintSchema = z.object({
  detections: z.record(z.boolean()),
  totalDetections: z.number(),
  privacyToolDetected: z.boolean(),
});

const ContentWindowFingerprintSchema = z.object({
  hash: z.string(),
  windowPropsCount: z.number(),
  properties: z.record(z.boolean()),
  methods: z.record(z.boolean()),
  hasDocument: z.boolean(),
  documentPropsCount: z.number(),
});

const CSSMediaFingerprintSchema = z.object({
  hash: z.string(),
  mediaQueryMatches: z.record(z.boolean()),
  pixelRatioMatches: z.record(z.boolean()),
  orientation: z.object({
    portrait: z.boolean(),
    landscape: z.boolean(),
  }),
  screenSizeMatches: z.record(z.boolean()),
});

const WebRTCFingerprintSchema = z.object({
  hash: z.string(),
  supported: z.boolean(),
  iceServers: z.object({
    stunSupported: z.boolean(),
    turnSupported: z.boolean(),
  }),
  candidates: z.object({
    local: z.array(z.string()),
    public: z.array(z.string()),
    ipv4: z.array(z.string()),
    ipv6: z.array(z.string()),
  }),
  connection: z.object({
    connectionState: z.string().optional(),
    iceConnectionState: z.string().optional(),
    iceGatheringState: z.string().optional(),
    signalingState: z.string().optional(),
  }),
  capabilities: z.object({
    audio: z.array(z.string()),
    video: z.array(z.string()),
  }),
  mediaDevices: z.boolean(),
  getUserMediaSupported: z.boolean(),
  rtcPeerConnectionSupported: z.boolean(),
  dataChannelSupported: z.boolean(),
});

const ServiceWorkerFingerprintSchema = z.object({
  hash: z.string(),
  supported: z.boolean(),
  controller: z.boolean(),
  ready: z.boolean(),
  scriptURL: z.string().optional(),
  scope: z.string().optional(),
  state: z.string().optional(),
  features: z.object({
    pushManager: z.boolean(),
    sync: z.boolean(),
    periodicSync: z.boolean(),
    backgroundFetch: z.boolean(),
    cacheAPI: z.boolean(),
    notifications: z.boolean(),
    paymentManager: z.boolean(),
    cookieStore: z.boolean(),
    getRegistrations: z.boolean(),
  }),
  permissions: z
    .object({
      notifications: z.string().optional(),
      push: z.string().optional(),
    })
    .optional(),
});

const TouchSupportFingerprintSchema = z.object({
  maxTouchPoints: z.number(),
  touchEvent: z.boolean(),
  touchStart: z.boolean(),
});

const LiesFingerprintSchema = z.object({
  hash: z.string(),
  lies: z.record(z.boolean()),
  liesCount: z.number(),
  trustScore: z.number(),
  inconsistencies: z.array(z.string()),
});

export const FingerprintDataSchema = z
  .object({
    canvas: CanvasFingerprintSchema.optional(),
    webgl: WebGLFingerprintSchema.optional(),
    navigator: NavigatorFingerprintSchema.optional(),
    screen: ScreenFingerprintSchema.optional(),
    screenFrame: ScreenFrameFingerprintSchema.optional(),
    screenResolution: ScreenResolutionFingerprintSchema.optional(),
    colorDepth: z.number().optional(),
    languages: LanguagesFingerprintSchema.optional(),
    deviceMemory: z.number().optional(),
    hardwareConcurrency: z.number().optional(),
    osCpu: z.string().optional(),
    cpuClass: z.string().optional(),
    platform: z.string().optional(),
    vendor: z.string().optional(),
    vendorFlavors: z.array(z.string()).optional(),
    fonts: FontsFingerprintSchema.optional(),
    domBlockers: DomBlockerFingerprintSchema.optional(),
    fontPreferences: FontPreferencesFingerprintSchema.optional(),
    colorGamut: z.enum(['srgb', 'p3', 'rec2020']).optional(),
    invertedColors: z.boolean().optional().nullable(),
    contrast: z.enum(['more', 'less', 'custom', 'no-preference']).optional(),
    forcedColors: z.object({ active: z.boolean() }).optional(),
    monochrome: z.number().optional(),
    reducedMotion: z.enum(['reduce', 'no-preference']).optional(),
    reducedTransparency: z.enum(['reduce', 'no-preference']).optional(),
    hdr: z.enum(['high', 'standard']).optional(),
    audioBaseLatency: AudioBaseLatencyFingerprintSchema.optional(),
    applePay: ApplePayFingerprintSchema.optional(),
    dateTimeLocale: z
      .union([z.string(), z.literal(-1), z.literal(-2), z.literal(-3)])
      .optional(),
    timezone: TimezoneFingerprintSchema.optional(),
    audio: AudioFingerprintSchema.optional(),
    media: MediaDevicesFingerprintSchema.optional(),
    clientRects: ClientRectsFingerprintSchema.optional(),
    voices: VoicesFingerprintSchema.optional(),
    svg: SVGFingerprintSchema.optional(),
    math: MathFingerprintSchema.optional(),
    css: CSSFingerprintSchema.optional(),
    textMetrics: TextMetricsFingerprintSchema.optional(),
    htmlElement: HTMLElementFingerprintSchema.optional(),
    consoleErrors: ConsoleErrorsFingerprintSchema.optional(),
    domRect: DomRectFingerprintSchema.optional(),
    mimeTypes: MimeTypesFingerprintSchema.optional(),
    plugins: z.array(PluginFingerprintSchema).optional(),
    resistance: ResistanceFingerprintSchema.optional(),
    contentWindow: ContentWindowFingerprintSchema.optional(),
    cssMedia: CSSMediaFingerprintSchema.optional(),
    webrtc: WebRTCFingerprintSchema.optional(),
    serviceWorker: ServiceWorkerFingerprintSchema.optional(),
    sessionStorage: z.boolean().optional(),
    localStorage: z.boolean().optional(),
    indexedDB: z.boolean().optional(),
    openDatabase: z.boolean().optional(),
    touchSupport: TouchSupportFingerprintSchema.optional(),
    cookiesEnabled: z.boolean().optional(),
    pdfViewerEnabled: z.boolean().optional(),
    architecture: z.number().optional(),
    privateClickMeasurement: z.string().optional(),
    lies: LiesFingerprintSchema.optional(),
  })
  .strict();
