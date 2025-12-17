/**
 * Browser fingerprint data collected from various sources
 */
export interface FingerprintData {
  canvas?: CanvasFingerprint;
  webgl?: WebGLFingerprint;
  navigator?: NavigatorFingerprint;
  screen?: ScreenFingerprint;
  screenFrame?: ScreenFrameFingerprint;
  screenResolution?: ScreenResolutionFingerprint;
  colorDepth?: number;
  languages?: LanguagesFingerprint;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  osCpu?: string;
  cpuClass?: string;
  platform?: string;
  vendor?: string;
  vendorFlavors?: string[];
  fonts?: FontsFingerprint;
  domBlockers?: DomBlockerFingerprint;
  fontPreferences?: FontPreferencesFingerprint;
  colorGamut?: ColorGamutFingerprint;
  invertedColors?: boolean | undefined;
  contrast?: ContrastPreference;
  forcedColors?: ForcedColorsFingerprint;
  monochrome?: number;
  reducedMotion?: ReducedMotionPreference;
  reducedTransparency?: ReducedTransparencyPreference;
  hdr?: HDRStatus;
  audioBaseLatency?: AudioBaseLatencyFingerprint;
  applePay?: ApplePayFingerprint;
  dateTimeLocale?: DateTimeLocaleFingerprint;
  timezone?: TimezoneFingerprint;
  audio?: AudioFingerprint;
  media?: MediaDevicesFingerprint;
  clientRects?: ClientRectsFingerprint;
  voices?: VoicesFingerprint;
  svg?: SVGFingerprint;
  math?: MathFingerprint;
  css?: CSSFingerprint;
  textMetrics?: TextMetricsFingerprint;
  htmlElement?: HTMLElementFingerprint;
  consoleErrors?: ConsoleErrorsFingerprint;
  domRect?: DomRectFingerprint;
  mimeTypes?: MimeTypesFingerprint;
  plugins?: PluginFingerprint[];
  resistance?: ResistanceFingerprint;
  contentWindow?: ContentWindowFingerprint;
  cssMedia?: CSSMediaFingerprint;
  webrtc?: WebRTCFingerprint;
  serviceWorker?: ServiceWorkerFingerprint;
  sessionStorage?: boolean;
  localStorage?: boolean;
  indexedDB?: boolean;
  openDatabase?: boolean;
  touchSupport?: TouchSupportFingerprint;
  cookiesEnabled?: boolean;
  pdfViewerEnabled?: boolean;
  architecture?: number;
  privateClickMeasurement?: string;
  lies?: LiesFingerprint;
}

/**
 * Canvas fingerprinting result
 */
export interface CanvasFingerprint {
  hash: string;
  dataURL?: string;
}

/**
 * WebGL fingerprinting result
 */
export interface WebGLFingerprint {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  unmaskedVendor?: string;
  unmaskedRenderer?: string;
  parameters?: Record<string, unknown>;
}

/**
 * Navigator API fingerprinting data
 */
export interface NavigatorFingerprint {
  userAgent: string;
  appVersion: string;
  appName: string;
  language: string;
  platform: string;
  product: string;
  productSub: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  onLine: boolean;
  webdriver?: boolean;
  connection?: {
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
    saveData?: boolean;
  };
}

/**
 * Screen fingerprinting data
 */
export interface ScreenFingerprint {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
}

export interface ScreenFrameFingerprint {
  top: number | null;
  right: number | null;
  bottom: number | null;
  left: number | null;
}

export type ScreenResolutionFingerprint = [number | null, number | null];

export type LanguagesFingerprint = string[][];

/**
 * Font detection fingerprint
 */
export interface FontsFingerprint {
  available: string[];
  count: number;
}

export interface DomBlockerFingerprint {
  detected: string[];
}

export interface FontPreferencesFingerprint {
  serif?: string;
  sansSerif?: string;
  monospace?: string;
}

export type ColorGamutFingerprint = 'srgb' | 'p3' | 'rec2020';
export type ContrastPreference = 'more' | 'less' | 'custom' | 'no-preference';
export interface ForcedColorsFingerprint {
  active: boolean;
}
export type ReducedMotionPreference = 'reduce' | 'no-preference';
export type ReducedTransparencyPreference = 'reduce' | 'no-preference';
export type HDRStatus = 'high' | 'standard';

export interface AudioBaseLatencyFingerprint {
  supported: boolean;
  baseLatency?: number;
  outputLatency?: number;
  sampleRate?: number;
}

export interface ApplePayFingerprint {
  isSupported: boolean;
  canMakePayments?: boolean;
  supportedVersions?: number[];
}

/**
 * Timezone and Intl fingerprint
 */
export interface TimezoneFingerprint {
  timezone: string;
  timezoneOffset: number;
  locale: string;
  calendar?: string;
  numberingSystem?: string;
  locales?: Record<string, unknown>;
  currency?: string;
  // Enhanced Intl API testing
  dateTimeFormat?: {
    formats: Record<string, string>;
    hourCycle?: string;
    timeZoneName?: string;
  };
  numberFormat?: {
    formats: Record<string, string>;
    notation?: string;
    signDisplay?: string;
  };
  collator?: {
    sensitivity?: string;
    caseFirst?: string;
    numeric?: boolean;
    comparisons: Record<string, number>;
  };
  pluralRules?: {
    cardinalRules: Record<string, string>;
    ordinalRules: Record<string, string>;
  };
  displayNames?: {
    languages: Record<string, string>;
    regions: Record<string, string>;
    currencies: Record<string, string>;
  };
  listFormat?: {
    formats: Record<string, string>;
  };
  relativeTimeFormat?: {
    formats: Record<string, string>;
  };
  supportedLocales?: {
    dateTimeFormat: number;
    numberFormat: number;
    collator: number;
    pluralRules: number;
  };
}

export const DateTimeLocaleStatus = {
  IntlAPINotSupported: -1,
  DateTimeFormatNotSupported: -2,
  LocaleNotAvailable: -3,
} as const;

export type DateTimeLocaleStatus =
  (typeof DateTimeLocaleStatus)[keyof typeof DateTimeLocaleStatus];
export type DateTimeLocaleFingerprint = string | DateTimeLocaleStatus;

/**
 * Audio Context fingerprint
 */
export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  state: string;
  maxChannelCount: number;
  numberOfInputs: number;
  numberOfOutputs: number;
  channelCount: number;
  channelCountMode: string;
  channelInterpretation: string;
}

/**
 * Media Devices fingerprint
 */
export interface MediaDevicesFingerprint {
  deviceCount: {
    audioInput: number;
    audioOutput: number;
    videoInput: number;
  };
  devices: Array<{
    kind: string;
    label: string;
    groupId: string;
  }>;
}

/**
 * Client Rects fingerprint (emoji rendering)
 */
export interface ClientRectsFingerprint {
  hash: string;
  data: number[];
}

/**
 * Speech Synthesis Voices fingerprint
 */
export interface VoicesFingerprint {
  count: number;
  voices: Array<{
    name: string;
    lang: string;
    localService: boolean;
    default: boolean;
    voiceURI: string;
  }>;
  defaultVoice?: string;
}

/**
 * SVG rendering fingerprint
 */
export interface SVGFingerprint {
  hash: string;
  data: number[];
  supported: boolean;
}

/**
 * Math runtime fingerprint
 */
export interface MathFingerprint {
  hash: string;
  data: Record<string, number>;
  constants: {
    PI: number;
    E: number;
    LN10: number;
    LN2: number;
    LOG10E: number;
    LOG2E: number;
    SQRT1_2: number;
    SQRT2: number;
  };
}

/**
 * CSS computed styles fingerprint
 */
export interface CSSFingerprint {
  hash: string;
  styles: Record<string, string>;
  systemFonts: Record<string, string>;
}

/**
 * TextMetrics fingerprint
 */
export interface TextMetricsFingerprint {
  hash: string;
  data: number[];
}

/**
 * HTMLElement features fingerprint
 */
export interface HTMLElementFingerprint {
  hash: string;
  prototypePropsCount: number;
  properties: Record<string, unknown>;
  methods: string[];
  shadowDOMSupport: boolean;
  customElementsSupport: boolean;
}

/**
 * Console Errors pattern fingerprint
 */
export interface ConsoleErrorsFingerprint {
  hash: string;
  consoleMethods: string[];
  errorProtoProps: number;
  stackDepth: number;
  errorPatterns: string[];
}

/**
 * DomRect measurement fingerprint
 */
export interface DomRectFingerprint {
  hash: string;
  measurements: number[];
  domRectSupport: boolean;
  domRectReadOnlySupport: boolean;
  rangeRectSupport: boolean;
}

/**
 * MimeTypes list fingerprint
 */
export interface MimeTypesFingerprint {
  hash: string;
  count: number;
  types: Array<{
    type: string;
    description: string;
    suffixes: string;
  }>;
}

export interface PluginFingerprint {
  name: string;
  description: string;
  mimeTypes: Array<{
    type: string;
    suffixes: string;
  }>;
}

/**
 * Resistance Detection fingerprint
 */
export interface ResistanceFingerprint {
  detections: Record<string, boolean>;
  totalDetections: number;
  privacyToolDetected: boolean;
}

export interface TouchSupportFingerprint {
  maxTouchPoints: number;
  touchEvent: boolean;
  touchStart: boolean;
}

/**
 * ContentWindow features fingerprint
 */
export interface ContentWindowFingerprint {
  hash: string;
  windowPropsCount: number;
  properties: Record<string, boolean>;
  methods: Record<string, boolean>;
  hasDocument: boolean;
  documentPropsCount: number;
}

/**
 * CSS Media queries fingerprint
 */
export interface CSSMediaFingerprint {
  hash: string;
  mediaQueryMatches: Record<string, boolean>;
  pixelRatioMatches: Record<string, boolean>;
  orientation: {
    portrait: boolean;
    landscape: boolean;
  };
  screenSizeMatches: Record<string, boolean>;
}

/**
 * WebRTC fingerprint
 */
export interface WebRTCFingerprint {
  hash: string;
  supported: boolean;
  iceServers: {
    stunSupported: boolean;
    turnSupported: boolean;
  };
  candidates: {
    local: string[];
    public: string[];
    ipv4: string[];
    ipv6: string[];
  };
  connection: {
    connectionState?: string;
    iceConnectionState?: string;
    iceGatheringState?: string;
    signalingState?: string;
  };
  capabilities: {
    audio: string[];
    video: string[];
  };
  mediaDevices: boolean;
  getUserMediaSupported: boolean;
  rtcPeerConnectionSupported: boolean;
  dataChannelSupported: boolean;
}

/**
 * ServiceWorker fingerprint
 */
export interface ServiceWorkerFingerprint {
  hash: string;
  supported: boolean;
  controller: boolean;
  ready: boolean;
  scriptURL?: string;
  scope?: string;
  state?: string;
  features: {
    pushManager: boolean;
    sync: boolean;
    periodicSync: boolean;
    backgroundFetch: boolean;
    cacheAPI: boolean;
    notifications: boolean;
    paymentManager: boolean;
    cookieStore: boolean;
    getRegistrations: boolean;
  };
  permissions?: {
    notifications?: string;
    push?: string;
  };
}

/**
 * Lies detection fingerprint (consistency analysis)
 */
export interface LiesFingerprint {
  hash: string;
  lies: Record<string, boolean>;
  liesCount: number;
  trustScore: number; // 0-100, higher is more trustworthy
  inconsistencies: string[];
}

export type CollectorStatus = 'success' | 'error' | 'skipped';

export interface CollectorSummary<T = unknown> {
  status: CollectorStatus;
  duration: number;
  value?: T;
  error?: string;
}

export interface CollectorCoverage {
  ratio: number;
  successful: number;
  failed: number;
  skipped: number;
}

/**
 * Timing information for each collector
 */
export interface CollectorTimings {
  canvas?: number;
  webgl?: number;
  navigator?: number;
  screen?: number;
  screenFrame?: number;
  screenResolution?: number;
  colorDepth?: number;
  languages?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  osCpu?: number;
  cpuClass?: number;
  platform?: number;
  vendor?: number;
  vendorFlavors?: number;
  fonts?: number;
  timezone?: number;
  audio?: number;
  media?: number;
  clientRects?: number;
  voices?: number;
  svg?: number;
  math?: number;
  css?: number;
  textMetrics?: number;
  htmlElement?: number;
  consoleErrors?: number;
  domRect?: number;
  mimeTypes?: number;
  plugins?: number;
  resistance?: number;
  contentWindow?: number;
  cssMedia?: number;
  webrtc?: number;
  serviceWorker?: number;
  sessionStorage?: number;
  localStorage?: number;
  indexedDB?: number;
  openDatabase?: number;
  touchSupport?: number;
  cookiesEnabled?: number;
  pdfViewerEnabled?: number;
  architecture?: number;
  privateClickMeasurement?: number;
  dateTimeLocale?: number;
  invertedColors?: number;
  lies?: number;
  total?: number;
  [key: string]: number | undefined;
}

/**
 * Generated fingerprint ID
 */
export interface FingerprintResult {
  fingerprintId: string;
  data: FingerprintData;
  timestamp: number;
  confidence: number;
  coverage: CollectorCoverage;
  timings: CollectorTimings;
  collectors: Record<string, CollectorSummary>;
}
