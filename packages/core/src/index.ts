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
export * from './utils/hash';

import type { FingerprintData, FingerprintResult, CollectorTimings, CollectorSummary } from './types';
import { collectLiesFingerprint } from './collectors/lies';
import { generateFingerprintId } from './utils/hash';
import { defaultSources } from './sources/registry';
import { runSources } from './sources/types';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const DEFAULT_IDLE_DELAY = 12;

/**
 * Collect all fingerprint data and generate a unique ID
 */
export async function collectFingerprint(): Promise<FingerprintResult> {
  const overallStart = now();
  const baseComponents = await runSources(defaultSources, { idleDelay: DEFAULT_IDLE_DELAY });
  const dataWithoutLies = buildFingerprintData(baseComponents);
  const liesComponent = await runLiesComponent(dataWithoutLies);

  const collectors: Record<string, CollectorSummary> = {
    ...baseComponents,
    lies: liesComponent,
  };

  const data: FingerprintData = {
    ...dataWithoutLies,
    lies: liesComponent.status === 'success' ? liesComponent.value : undefined,
  };

  const fingerprintId = generateFingerprintId(data);
  const confidence = calculateConfidence(collectors);
  const timings = buildTimings(collectors);
  timings.total = now() - overallStart;

  return {
    fingerprintId,
    data,
    timestamp: Date.now(),
    confidence,
    timings,
    collectors,
  };
}

function buildFingerprintData(collectors: Record<string, CollectorSummary>): FingerprintData {
  const value = <T>(key: string): T | undefined => {
    const component = collectors[key];
    return component?.status === 'success' ? (component.value as T) : undefined;
  };

  return {
    canvas: value('canvas'),
    webgl: value('webgl'),
    navigator: value('navigator'),
    screen: value('screen'),
    fonts: value('fonts'),
    domBlockers: value('domBlockers'),
    fontPreferences: value('fontPreferences'),
    colorGamut: value('colorGamut'),
    contrast: value('contrast'),
    forcedColors: value('forcedColors'),
    monochrome: value('monochrome'),
    reducedMotion: value('reducedMotion'),
    reducedTransparency: value('reducedTransparency'),
    hdr: value('hdr'),
    audioBaseLatency: value('audioBaseLatency'),
    applePay: value('applePay'),
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
    resistance: value('resistance'),
    contentWindow: value('contentWindow'),
    cssMedia: value('cssMedia'),
    webrtc: value('webrtc'),
    serviceWorker: value('serviceWorker'),
  };
}

async function runLiesComponent(data: FingerprintData): Promise<CollectorSummary> {
  const start = now();
  try {
    const value = await collectLiesFingerprint(data);
    return {
      status: 'success',
      value,
      duration: now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to compute lies component',
      duration: now() - start,
    };
  }
}

function calculateConfidence(collectors: Record<string, CollectorSummary>): number {
  const entries = Object.values(collectors);
  if (entries.length === 0) {
    return 0;
  }

  const successful = entries.filter((component) => component.status === 'success' && component.value !== undefined && component.value !== null).length;
  return successful / entries.length;
}

function buildTimings(collectors: Record<string, CollectorSummary>): CollectorTimings {
  const timings: CollectorTimings = {};
  for (const [name, component] of Object.entries(collectors)) {
    timings[name] = component.duration;
  }
  return timings;
}
