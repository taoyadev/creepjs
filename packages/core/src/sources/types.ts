import { mapWithIdleBreaks } from '../utils/async';
import type { MaybePromise } from '../utils/async';
import type { CollectorSummary } from '../types';

export type Source<T> = () => MaybePromise<T>;
export type SourceRegistry = Record<string, Source<unknown>>;

export interface RunSourcesOptions {
  idleDelay?: number;
  concurrency?: number;
}

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

async function runSource<T>(source: Source<T>): Promise<CollectorSummary<T>> {
  const start = now();
  try {
    const value = await source();
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

  const components = await mapWithIdleBreaks(
    entries,
    async ([name, source]) => ({ name, component: await runSource(source) }),
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
