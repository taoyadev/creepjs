export * from './types';
export * from './collectors/canvas';
export * from './collectors/webgl';
export * from './collectors/navigator';
export * from './collectors/screen';
export * from './collectors/fonts';
export * from './collectors/timezone';
export * from './collectors/audio';
export * from './collectors/media';
export * from './collectors/clientRects';
export * from './collectors/voices';
export * from './collectors/svg';
export * from './collectors/math';
export * from './collectors/css';
export * from './collectors/textMetrics';
export * from './collectors/htmlElement';
export * from './collectors/consoleErrors';
export * from './collectors/domRect';
export * from './collectors/mimeTypes';
export * from './collectors/resistance';
export * from './collectors/contentWindow';
export * from './collectors/cssMedia';
export * from './collectors/webrtc';
export * from './collectors/serviceWorker';
export * from './collectors/lies';
export * from './collectors/domBlockers';
export * from './collectors/fontPreferences';
export * from './collectors/colorGamut';
export * from './collectors/contrast';
export * from './collectors/forcedColors';
export * from './collectors/monochrome';
export * from './collectors/reducedMotion';
export * from './collectors/reducedTransparency';
export * from './collectors/hdr';
export * from './collectors/audioBaseLatency';
export * from './collectors/applePay';
export * from './collectors/architecture';
export * from './collectors/colorDepth';
export * from './collectors/cookiesEnabled';
export * from './collectors/cpuClass';
export * from './collectors/dateTimeLocale';
export * from './collectors/deviceMemory';
export * from './collectors/hardwareConcurrency';
export * from './collectors/indexedDB';
export * from './collectors/invertedColors';
export * from './collectors/languages';
export * from './collectors/localStorage';
export * from './collectors/openDatabase';
export * from './collectors/osCpu';
export * from './collectors/pdfViewer';
export * from './collectors/platform';
export * from './collectors/plugins';
export * from './collectors/privateClickMeasurement';
export * from './collectors/screenFrame';
export * from './collectors/screenResolution';
export * from './collectors/sessionStorage';
export * from './collectors/touchSupport';
export * from './collectors/vendor';
export * from './collectors/vendorFlavors';
export * from './utils/hash';

export type {
  FingerprintData,
  FingerprintResult,
  CollectorTimings,
  CollectorSummary,
  CollectorCoverage,
  CanvasFingerprint,
  WebGLFingerprint,
  NavigatorFingerprint,
  ScreenFingerprint,
  ScreenFrameFingerprint,
  ScreenResolutionFingerprint,
  LanguagesFingerprint,
  FontsFingerprint,
  DomBlockerFingerprint,
  FontPreferencesFingerprint,
  ColorGamutFingerprint,
  ContrastPreference,
  ForcedColorsFingerprint,
  ReducedMotionPreference,
  ReducedTransparencyPreference,
  HDRStatus,
  AudioBaseLatencyFingerprint,
  ApplePayFingerprint,
  TimezoneFingerprint,
  DateTimeLocaleFingerprint,
  AudioFingerprint,
  MediaDevicesFingerprint,
  ClientRectsFingerprint,
  VoicesFingerprint,
  SVGFingerprint,
  MathFingerprint,
  CSSFingerprint,
  TextMetricsFingerprint,
  HTMLElementFingerprint,
  ConsoleErrorsFingerprint,
  DomRectFingerprint,
  MimeTypesFingerprint,
  PluginFingerprint,
  ResistanceFingerprint,
  TouchSupportFingerprint,
  ContentWindowFingerprint,
  CSSMediaFingerprint,
  WebRTCFingerprint,
  ServiceWorkerFingerprint,
  LiesFingerprint,
  CollectorStatus,
} from './types';
export { DateTimeLocaleStatus } from './types';
import type {
  FingerprintData,
  FingerprintResult,
  CollectorTimings,
  CollectorSummary,
  CollectorCoverage,
  LiesFingerprint,
} from './types';
import { collectLiesFingerprint } from './collectors/lies';
import { generateFingerprintId } from './utils/hash';
import { defaultSources } from './sources/registry';
import { runSources } from './sources/types';

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();
const DEFAULT_IDLE_DELAY = 12;
const DEFAULT_CONCURRENCY =
  typeof navigator !== 'undefined' &&
  typeof navigator.hardwareConcurrency === 'number'
    ? Math.min(4, Math.max(1, Math.floor(navigator.hardwareConcurrency / 2)))
    : 2;

export interface CollectFingerprintOptions {
  idleDelay?: number;
  concurrency?: number;
}

/**
 * Collect all fingerprint data and generate a unique ID
 */
export async function collectFingerprint(
  options: CollectFingerprintOptions = {}
): Promise<FingerprintResult> {
  const overallStart = now();
  const baseComponents = await runSources(defaultSources, {
    idleDelay: options.idleDelay ?? DEFAULT_IDLE_DELAY,
    concurrency: options.concurrency ?? DEFAULT_CONCURRENCY,
  });
  const dataWithoutLies = buildFingerprintData(baseComponents);
  const liesComponent = await runLiesComponent(dataWithoutLies);

  const collectors: Record<string, CollectorSummary> = {
    ...baseComponents,
    lies: liesComponent,
  };

  const liesValue: LiesFingerprint | undefined =
    liesComponent.status === 'success'
      ? (liesComponent.value as LiesFingerprint)
      : undefined;

  const data: FingerprintData = {
    ...dataWithoutLies,
    lies: liesValue,
  };

  const fingerprintId = generateFingerprintId(data);
  const coverage = calculateCoverageStats(collectors);
  const confidence = coverage.ratio;
  const timings = buildTimings(collectors);
  timings.total = now() - overallStart;

  return {
    fingerprintId,
    data,
    timestamp: Date.now(),
    confidence,
    coverage,
    timings,
    collectors,
  };
}

function buildFingerprintData(
  collectors: Record<string, CollectorSummary>
): FingerprintData {
  const value = <T>(key: string): T | undefined => {
    const component = collectors[key];
    return component?.status === 'success' ? (component.value as T) : undefined;
  };

  return {
    canvas: value('canvas'),
    webgl: value('webgl'),
    navigator: value('navigator'),
    screen: value('screen'),
    screenFrame: value('screenFrame'),
    screenResolution: value('screenResolution'),
    colorDepth: value('colorDepth'),
    languages: value('languages'),
    fonts: value('fonts'),
    domBlockers: value('domBlockers'),
    fontPreferences: value('fontPreferences'),
    colorGamut: value('colorGamut'),
    invertedColors: value('invertedColors'),
    contrast: value('contrast'),
    forcedColors: value('forcedColors'),
    monochrome: value('monochrome'),
    reducedMotion: value('reducedMotion'),
    reducedTransparency: value('reducedTransparency'),
    hdr: value('hdr'),
    audioBaseLatency: value('audioBaseLatency'),
    applePay: value('applePay'),
    dateTimeLocale: value('dateTimeLocale'),
    timezone: value('timezone'),
    audio: value('audio'),
    media: value('media'),
    clientRects: value('clientRects'),
    voices: value('voices'),
    svg: value('svg'),
    math: value('math'),
    css: value('css'),
    textMetrics: value('textMetrics'),
    htmlElement: value('htmlElement'),
    consoleErrors: value('consoleErrors'),
    domRect: value('domRect'),
    mimeTypes: value('mimeTypes'),
    plugins: value('plugins'),
    resistance: value('resistance'),
    contentWindow: value('contentWindow'),
    cssMedia: value('cssMedia'),
    webrtc: value('webrtc'),
    serviceWorker: value('serviceWorker'),
    deviceMemory: value('deviceMemory'),
    hardwareConcurrency: value('hardwareConcurrency'),
    osCpu: value('osCpu'),
    cpuClass: value('cpuClass'),
    platform: value('platform'),
    vendor: value('vendor'),
    vendorFlavors: value('vendorFlavors'),
    sessionStorage: value('sessionStorage'),
    localStorage: value('localStorage'),
    indexedDB: value('indexedDB'),
    openDatabase: value('openDatabase'),
    touchSupport: value('touchSupport'),
    cookiesEnabled: value('cookiesEnabled'),
    pdfViewerEnabled: value('pdfViewerEnabled'),
    architecture: value('architecture'),
    privateClickMeasurement: value('privateClickMeasurement'),
  };
}

async function runLiesComponent(
  data: FingerprintData
): Promise<CollectorSummary> {
  const start = now();
  try {
    const value = await collectLiesFingerprint(data);
    return {
      status: value ? 'success' : 'skipped',
      value,
      duration: now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Failed to compute lies component',
      duration: now() - start,
    };
  }
}

function calculateCoverageStats(
  collectors: Record<string, CollectorSummary>
): CollectorCoverage {
  const entries = Object.values(collectors);
  const successful = entries.filter(
    (component) => component.status === 'success'
  ).length;
  const failed = entries.filter(
    (component) => component.status === 'error'
  ).length;
  const skipped = entries.filter(
    (component) => component.status === 'skipped'
  ).length;
  const considered = successful + failed;
  const ratio = considered === 0 ? 0 : successful / considered;

  return {
    ratio,
    successful,
    failed,
    skipped,
  };
}

function buildTimings(
  collectors: Record<string, CollectorSummary>
): CollectorTimings {
  const timings: CollectorTimings = {};
  for (const [name, component] of Object.entries(collectors)) {
    timings[name] = component.duration;
  }
  return timings;
}
