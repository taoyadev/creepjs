import type { Env } from '../types';
import type { StatsRequest, StatsResult } from '../durable/StatsCounter';

export type UniquenessComponent =
  | 'canvas'
  | 'webgl'
  | 'timezone'
  | 'fonts'
  | 'screen';

interface BucketSample {
  component: UniquenessComponent;
  bucket: string;
}

interface UniquenessInput {
  canvas?: { hash?: string };
  webgl?: { renderer?: string; unmaskedRenderer?: string };
  timezone?: { timezone?: string };
  fonts?: { count?: number };
  screen?: {
    width?: number;
    height?: number;
    devicePixelRatio?: number;
  };
}

interface ComponentEstimate {
  component: UniquenessComponent;
  bucket: string;
  sampleSize: number | null;
  rarity: number | null;
  suppressed: boolean;
}

export interface UniquenessResponse {
  totalSamples: number;
  kAnonThreshold: number;
  estimates: Partial<Record<UniquenessComponent, ComponentEstimate>>;
}

const TOTAL_KEY = 'fpstats:v1:total';
const DEFAULT_K_ANON = 20;
const MAX_BUCKET_WRITES = 5;
const SCREEN_DPR_PRECISION = 1;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

// FNV-1a keeps bucket IDs compact without storing raw signal values.
function hashBucket(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function bucketizeFonts(count: number) {
  if (count < 25) return '0-24';
  if (count < 50) return '25-49';
  if (count < 75) return '50-74';
  return '75+';
}

function bucketizeScreen(data: UniquenessInput['screen']) {
  if (
    !data ||
    typeof data.width !== 'number' ||
    typeof data.height !== 'number'
  ) {
    return null;
  }

  const dpr =
    typeof data.devicePixelRatio === 'number' &&
    Number.isFinite(data.devicePixelRatio)
      ? data.devicePixelRatio.toFixed(SCREEN_DPR_PRECISION)
      : 'unknown';
  return `${data.width}x${data.height}@${dpr}`;
}

function toKAnon(env: Env['Bindings']) {
  const parsed = Number.parseInt(env.FP_STATS_K_ANON ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_K_ANON;
}

function bucketKey(component: UniquenessComponent, bucket: string) {
  return `fpstats:v1:${component}:${bucket}`;
}

export function extractUniquenessBuckets(
  data: UniquenessInput
): BucketSample[] {
  const samples: BucketSample[] = [];

  if (data.canvas?.hash) {
    samples.push({
      component: 'canvas',
      bucket: normalize(data.canvas.hash).slice(0, 8),
    });
  }

  const webglValue = data.webgl?.unmaskedRenderer || data.webgl?.renderer;
  if (webglValue) {
    samples.push({
      component: 'webgl',
      bucket: hashBucket(normalize(webglValue)),
    });
  }

  if (data.timezone?.timezone) {
    samples.push({
      component: 'timezone',
      bucket: hashBucket(normalize(data.timezone.timezone)),
    });
  }

  if (typeof data.fonts?.count === 'number') {
    samples.push({
      component: 'fonts',
      bucket: hashBucket(bucketizeFonts(data.fonts.count)),
    });
  }

  const screenBucket = bucketizeScreen(data.screen);
  if (screenBucket) {
    samples.push({
      component: 'screen',
      bucket: hashBucket(screenBucket),
    });
  }

  return samples.slice(0, MAX_BUCKET_WRITES);
}

/** All counters live in one StatsCounter instance; see durable/StatsCounter.ts. */
const STATS_OBJECT_NAME = 'fpstats:v1';

async function statsCall(
  env: Env['Bindings'],
  body: StatsRequest
): Promise<StatsResult> {
  const stub = env.STATS.get(env.STATS.idFromName(STATS_OBJECT_NAME));
  const response = await stub.fetch('https://stats.internal/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json<StatsResult>();
}

export async function recordUniquenessStats(
  data: UniquenessInput,
  env: Env['Bindings']
) {
  const keys = [
    TOTAL_KEY,
    ...extractUniquenessBuckets(data).map((sample) =>
      bucketKey(sample.component, sample.bucket)
    ),
  ];
  await statsCall(env, { op: 'increment', keys });
}

function parseComponentQuery(query: string) {
  const samples: BucketSample[] = [];

  const params = new URLSearchParams(query);
  const componentKeys: UniquenessComponent[] = [
    'canvas',
    'webgl',
    'timezone',
    'fonts',
    'screen',
  ];

  for (const component of componentKeys) {
    const value = params.get(component);
    if (!value) continue;

    if (component === 'canvas') {
      samples.push({ component, bucket: normalize(value).slice(0, 8) });
      continue;
    }

    if (component === 'fonts') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        samples.push({
          component,
          bucket: hashBucket(bucketizeFonts(parsed)),
        });
      }
      continue;
    }

    if (component === 'screen') {
      samples.push({
        component,
        bucket: hashBucket(normalize(value)),
      });
      continue;
    }

    samples.push({
      component,
      bucket: hashBucket(normalize(value)),
    });
  }

  return samples;
}

export async function getUniquenessEstimates(
  rawQuery: string,
  env: Env['Bindings']
): Promise<UniquenessResponse> {
  const buckets = parseComponentQuery(rawQuery);
  const counts = await statsCall(env, {
    op: 'read',
    keys: [
      TOTAL_KEY,
      ...buckets.map(({ component, bucket }) => bucketKey(component, bucket)),
    ],
  });

  const totalSamples = counts[TOTAL_KEY] ?? 0;
  const kAnonThreshold = toKAnon(env);
  const estimates: Partial<Record<UniquenessComponent, ComponentEstimate>> = {};

  for (const { component, bucket } of buckets) {
    const sampleSize = counts[bucketKey(component, bucket)] ?? 0;
    const suppressed =
      totalSamples < kAnonThreshold || sampleSize < kAnonThreshold;

    estimates[component] = {
      component,
      bucket,
      sampleSize: suppressed ? null : sampleSize,
      rarity:
        suppressed || totalSamples === 0
          ? null
          : Number((sampleSize / totalSamples).toFixed(4)),
      suppressed,
    };
  }

  return {
    totalSamples,
    kAnonThreshold,
    estimates,
  };
}
