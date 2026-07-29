'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collectFingerprint,
  getCollectorLabel,
  type CollectorProgressEvent,
  type FingerprintResult,
} from '@creepjs/core';
import { analytics } from '@/lib/analytics';
import {
  fetchBaseline,
  type BaselineResponse,
} from '@/lib/uniqueness-baseline';
import type {
  CollectionProgress,
  FingerprintScanStatus,
} from '@/components/checker/types';

interface ScanProgressState extends CollectionProgress {
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

function scheduleIdle(callback: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 180);
  return () => window.clearTimeout(timeoutId);
}

export interface FingerprintScan {
  fingerprint: FingerprintResult | null;
  baseline: BaselineResponse | null;
  progress: CollectionProgress;
  status: FingerprintScanStatus;
  error: string | null;
  scan: () => Promise<void>;
}

export function useFingerprintScan(): FingerprintScan {
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(
    null
  );
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [progress, setProgress] = useState<ScanProgressState>(
    INITIAL_SCAN_PROGRESS
  );
  const [status, setStatus] = useState<FingerprintScanStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const scan = useCallback(async () => {
    const currentRun = ++runId.current;
    setStatus('loading');
    setError(null);
    setBaseline(null);
    setProgress(INITIAL_SCAN_PROGRESS);

    try {
      const result = await collectFingerprint({
        onProgress: (event) => {
          if (runId.current === currentRun) {
            setProgress((previous) => reduceScanProgress(previous, event));
          }
        },
      });
      if (runId.current !== currentRun) return;

      setProgress((previous) => ({
        ...previous,
        current: previous.total,
        currentCollector: 'Complete',
      }));
      setFingerprint(result);
      setStatus('ready');

      void fetchBaseline(result)
        .then((response) => {
          if (runId.current === currentRun) setBaseline(response);
        })
        .catch(() => {
          if (runId.current === currentRun) setBaseline(null);
        });

      analytics.pageView('/checker');
      analytics.track.fingerprintGenerated({
        confidence: result.confidence,
        method: 'checker',
      });
      analytics.track.buttonClicked({
        buttonLabel: 'run_checker',
        section: 'checker',
      });
    } catch (scanError) {
      if (runId.current !== currentRun) return;
      console.error('Error collecting fingerprint:', scanError);
      analytics.error(
        scanError instanceof Error ? scanError : String(scanError),
        { page: '/checker' }
      );
      setError(
        'Fingerprint collection failed. Your browser may block a required API.'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const cancel = scheduleIdle(() => {
      void scan();
    });
    return () => {
      cancel();
      runId.current += 1;
    };
  }, [scan]);

  return {
    fingerprint,
    baseline,
    progress,
    status,
    error,
    scan,
  };
}
