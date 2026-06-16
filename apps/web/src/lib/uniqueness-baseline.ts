import type { FingerprintResult } from '@creepjs/core';
import { SITE_CONFIG } from '@/lib/metadata';

export type BaselineComponent =
  | 'canvas'
  | 'webgl'
  | 'timezone'
  | 'fonts'
  | 'screen';

export interface BaselineEstimate {
  component: BaselineComponent;
  bucket: string;
  sampleSize: number | null;
  rarity: number | null;
  suppressed: boolean;
}

export interface BaselineResponse {
  totalSamples: number;
  kAnonThreshold: number;
  estimates: Partial<Record<BaselineComponent, BaselineEstimate>>;
}

export interface BaselineSummary {
  rarityScore: number | null;
  rarityPercent: number | null;
  sampleCount: number;
  availableComponents: number;
}

export function buildBaselineQuery(result: FingerprintResult) {
  const params = new URLSearchParams();

  if (result.data.canvas?.hash) {
    params.set('canvas', result.data.canvas.hash);
  }

  const webglValue =
    result.data.webgl?.unmaskedRenderer || result.data.webgl?.renderer;
  if (webglValue) {
    params.set('webgl', webglValue);
  }

  if (result.data.timezone?.timezone) {
    params.set('timezone', result.data.timezone.timezone);
  }

  if (typeof result.data.fonts?.count === 'number') {
    params.set('fonts', String(result.data.fonts.count));
  }

  if (result.data.screen) {
    params.set(
      'screen',
      `${result.data.screen.width}x${result.data.screen.height}@${result.data.screen.devicePixelRatio.toFixed(1)}`
    );
  }

  return params.toString();
}

export async function fetchBaseline(
  result: FingerprintResult
): Promise<BaselineResponse | null> {
  const query = buildBaselineQuery(result);
  if (!query) return null;

  const res = await fetch(`${SITE_CONFIG.apiUrl}/v1/stats/uniqueness?${query}`);
  if (!res.ok) return null;

  return (await res.json()) as BaselineResponse;
}

export function labelForBaselineComponent(component: BaselineComponent) {
  const labels: Record<BaselineComponent, string> = {
    canvas: 'Canvas',
    webgl: 'WebGL',
    timezone: 'Timezone',
    fonts: 'Fonts',
    screen: 'Screen',
  };

  return labels[component];
}

export function summarizeBaseline(
  baseline: BaselineResponse | null | undefined
): BaselineSummary | null {
  if (!baseline) return null;

  const estimates = Object.values(baseline.estimates).filter(
    (
      estimate
    ): estimate is BaselineEstimate & { rarity: number; sampleSize: number } =>
      Boolean(
        estimate &&
          !estimate.suppressed &&
          typeof estimate.rarity === 'number' &&
          typeof estimate.sampleSize === 'number'
      )
  );

  if (estimates.length === 0) {
    return {
      rarityScore: null,
      rarityPercent: null,
      sampleCount: baseline.totalSamples,
      availableComponents: 0,
    };
  }

  const rarityScore =
    estimates.reduce((sum, estimate) => sum + (1 - estimate.rarity), 0) /
    estimates.length;

  return {
    rarityScore,
    rarityPercent: Math.round(rarityScore * 100),
    sampleCount: baseline.totalSamples,
    availableComponents: estimates.length,
  };
}

export function getBaselineEstimate(
  baseline: BaselineResponse | null | undefined,
  component: BaselineComponent
) {
  return baseline?.estimates[component] ?? null;
}

export function formatBaselineInsight(
  estimate: BaselineEstimate | null | undefined,
  kAnonThreshold: number | undefined
) {
  if (!estimate) return null;
  if (estimate.suppressed) {
    return `Population rarity hidden until at least ${kAnonThreshold ?? 'k'} matching samples exist`;
  }

  const rarityPercent = Math.round((1 - (estimate.rarity ?? 0)) * 100);
  return `${rarityPercent}% rare in the anonymous population baseline`;
}
