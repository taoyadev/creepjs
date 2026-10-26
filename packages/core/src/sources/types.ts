import { mapWithIdleBreaks, withTimeout } from '../utils/async';
import type { MaybePromise } from '../utils/async';
import type { CollectorProgressEvent, CollectorSummary } from '../types';

export type Source<T> = () => MaybePromise<T>;
export type SourceRegistry = Record<string, Source<unknown>>;

export interface RunSourcesOptions {
  idleDelay?: number;
  concurrency?: number;
  total?: number;
  /** Per-source ceiling; a source still pending after this counts as an error. */
  sourceTimeout?: number;
  onProgress?: (event: CollectorProgressEvent) => void;
}

/**
 * Backstop for a source whose browser API never settles (a `voiceschanged`
 * event that never fires, an audio render suspended in a background tab).
 * Sources with their own waits stay well under it: WebRTC's ICE wait is 2s.
 */
export const DEFAULT_SOURCE_TIMEOUT_MS = 5000;

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

async function runSource<T>(
  name: string,
  source: Source<T>,
  timeoutMs: number
): Promise<CollectorSummary<T>> {
  const start = now();
  try {
    const value = await withTimeout(
      Promise.resolve().then(source),
      timeoutMs,
      name
    );
    const status =
      value === undefined || value === null ? 'skipped' : 'success';
    return {
      status,
      value,
      duration: now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      error: normalizeError(error),
      duration: now() - start,
    };
  }
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch (_jsonError) {
    void _jsonError;
    return 'Unknown error';
  }
}

export async function runSources(
  registry: SourceRegistry,
  options: RunSourcesOptions = {}
): Promise<Record<string, CollectorSummary>> {
  const entries = Object.entries(registry);
  const total = options.total ?? entries.length;

  const components = await mapWithIdleBreaks(
    entries,
    async ([name, source], index) => {
      options.onProgress?.({
        name,
        index,
        total,
        phase: 'start',
      });

      const component = await runSource(
        name,
        source,
        options.sourceTimeout ?? DEFAULT_SOURCE_TIMEOUT_MS
      );

      options.onProgress?.({
        name,
        index,
        total,
        phase: 'finish',
        status: component.status,
        duration: component.duration,
      });

      return { name, component };
    },
    { idleDelay: options.idleDelay, concurrency: options.concurrency }
  );

  return components.reduce<Record<string, CollectorSummary>>(
    (acc, { name, component }) => {
      acc[name] = component;
      return acc;
    },
    {}
  );
}
