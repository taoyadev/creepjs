import type { Env } from '../types';

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

async function incrementCounter(kv: KVNamespace, key: string) {
  const current = Number.parseInt((await kv.get(key, 'text')) ?? '0', 10);
  await kv.put(key, String(Number.isFinite(current) ? current + 1 : 1));
}

export async function recordUniquenessStats(
  data: UniquenessInput,
  env: Env['Bindings']
) {
  const buckets = extractUniquenessBuckets(data);

  await incrementCounter(env.FP_STATS, TOTAL_KEY);
  await Promise.all(
    buckets.map((sample) =>
      incrementCounter(env.FP_STATS, bucketKey(sample.component, sample.bucket))
    )
  );
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
  const total = Number.parseInt(
    (await env.FP_STATS.get(TOTAL_KEY, 'text')) ?? '0',
    10
  );
  const totalSamples = Number.isFinite(total) ? total : 0;
  const kAnonThreshold = toKAnon(env);
  const estimates: Partial<Record<UniquenessComponent, ComponentEstimate>> = {};

  const buckets = parseComponentQuery(rawQuery);

  await Promise.all(
    buckets.map(async ({ component, bucket }) => {
      const rawCount = Number.parseInt(
        (await env.FP_STATS.get(bucketKey(component, bucket), 'text')) ?? '0',
        10
      );
      const sampleSize = Number.isFinite(rawCount) ? rawCount : 0;
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
    })
  );

  return {
    totalSamples,
    kAnonThreshold,
    estimates,
  };
}
