import { getCollectorLabel, type CollectorProgressEvent } from '@creepjs/core';
import type { CollectionProgress } from '@/components/checker/types';

/**
 * Scan progress shared by the checker and the homepage teaser. Kept apart from
 * useFingerprintScan so a page can show progress without statically importing
 * the collectors: the only value it takes from core is the label lookup.
 */
export interface ScanProgressState extends CollectionProgress {
  completedCollectors: readonly string[];
}

export const INITIAL_SCAN_PROGRESS: ScanProgressState = {
  current: 0,
  total: 1,
  currentCollector: 'Initializing...',
  completedCollectors: [],
};

export function reduceScanProgress(
  state: ScanProgressState,
  event: CollectorProgressEvent
): ScanProgressState {
  const total = Math.max(event.total, 1);
  if (event.phase === 'start') {
    return {
      ...state,
      total,
      currentCollector: getCollectorLabel(event.name),
    };
  }

  const completed = new Set(state.completedCollectors);
  completed.add(event.name);
  return {
    current: Math.min(completed.size, total),
    total,
    currentCollector: `${getCollectorLabel(event.name)} complete`,
    completedCollectors: [...completed],
  };
}
