import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapWithIdleBreaks } from '../src/utils/async';
import { runSources, type SourceRegistry } from '../src/sources/types';

afterEach(() => {
  vi.useRealTimers();
});

describe('mapWithIdleBreaks', () => {
  it('iterates sequentially while yielding between items', async () => {
    vi.useFakeTimers();
    const iterator = vi.fn(async (value: number) => value * 2);

    const promise = mapWithIdleBreaks([1, 2, 3], iterator, 5);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(iterator).toHaveBeenCalledTimes(3);
    expect(result).toEqual([2, 4, 6]);
  });

  it('supports executing multiple workers concurrently', async () => {
    const concurrencySamples: number[] = [];
    let active = 0;

    const result = await mapWithIdleBreaks(
      [1, 2, 3, 4],
      async (value) => {
        active += 1;
        concurrencySamples.push(active);
        await Promise.resolve();
        active -= 1;
        return value * 3;
      },
      { idleDelay: 0, concurrency: 2 }
    );

    expect(result).toEqual([3, 6, 9, 12]);
    expect(Math.max(...concurrencySamples)).toBeGreaterThan(1);
  });
});

describe('runSources', () => {
  it('returns success and error components with durations', async () => {
    const registry: SourceRegistry = {
      success: () => 42,
      failure: () => {
        throw new Error('boom');
      },
    };

    const components = await runSources(registry, { idleDelay: 0 });

    expect(components.success.status).toBe('success');
    expect(components.success.value).toBe(42);
    expect(typeof components.success.duration).toBe('number');

    expect(components.failure.status).toBe('error');
    expect(components.failure.error).toContain('boom');
  });

  it('emits start and finish progress events for each source', async () => {
    const events: Array<{
      name: string;
      phase: string;
      status?: string;
      index: number;
      total: number;
    }> = [];

    const registry: SourceRegistry = {
      alpha: () => 'ok',
      beta: () => null,
    };

    await runSources(registry, {
      idleDelay: 0,
      onProgress: (event) => {
        events.push({
          name: event.name,
          phase: event.phase,
          status: event.status,
          index: event.index,
          total: event.total,
        });
      },
    });

    expect(events).toEqual([
      { name: 'alpha', phase: 'start', status: undefined, index: 0, total: 2 },
      {
        name: 'alpha',
        phase: 'finish',
        status: 'success',
        index: 0,
        total: 2,
      },
      { name: 'beta', phase: 'start', status: undefined, index: 1, total: 2 },
      {
        name: 'beta',
        phase: 'finish',
        status: 'skipped',
        index: 1,
        total: 2,
      },
    ]);
  });
});
