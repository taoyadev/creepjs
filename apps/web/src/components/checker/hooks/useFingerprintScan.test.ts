import { describe, expect, it } from 'vitest';
import type { CollectorProgressEvent } from '@creepjs/core';
import {
  INITIAL_SCAN_PROGRESS,
  reduceScanProgress,
} from './useFingerprintScan';

function event(
  name: CollectorProgressEvent['name'],
  phase: CollectorProgressEvent['phase'],
  index: number,
  total = 8
): CollectorProgressEvent {
  return { name, phase, index, total };
}

describe('reduceScanProgress', () => {
  it('does not count a collector until it finishes', () => {
    const next = reduceScanProgress(
      INITIAL_SCAN_PROGRESS,
      event('canvas', 'start', 0)
    );

    expect(next.current).toBe(0);
    expect(next.total).toBe(8);
    expect(next.currentCollector).toMatch(/canvas/i);
  });

  it('counts out-of-order completions without using their index', () => {
    const first = reduceScanProgress(
      INITIAL_SCAN_PROGRESS,
      event('webgl', 'finish', 5)
    );
    const second = reduceScanProgress(first, event('canvas', 'finish', 1));

    expect(first.current).toBe(1);
    expect(second.current).toBe(2);
  });

  it('does not count duplicate completion events twice', () => {
    const first = reduceScanProgress(
      INITIAL_SCAN_PROGRESS,
      event('canvas', 'finish', 0)
    );
    const duplicate = reduceScanProgress(first, event('canvas', 'finish', 0));

    expect(duplicate.current).toBe(1);
    expect(duplicate.current).toBeLessThanOrEqual(duplicate.total);
  });
});
