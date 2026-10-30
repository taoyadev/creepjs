'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FingerprintResult } from '@creepjs/core';
import {
  INITIAL_SCAN_PROGRESS,
  reduceScanProgress,
  type ScanProgressState,
} from '@/components/checker/scanProgressState';
import { trackEvent } from '@/lib/analytics';
import { scheduleIdle } from '@/lib/schedule-idle';

export type LazyScanStatus = 'idle' | 'loading' | 'ready' | 'error';

interface LazyScanOptions {
  /** Start once the page is idle instead of waiting for `scan()`. */
  autoStart?: boolean;
}

/**
 * Full local scan whose collectors load on demand, so they stay out of the
 * page's initial chunks. A rerun keeps the last result until it settles, and
 * results from a superseded run or an unmounted component are dropped.
 */
export function useLazyFingerprintScan({
  autoStart = false,
}: LazyScanOptions = {}) {
  const [status, setStatus] = useState<LazyScanStatus>(
    autoStart ? 'loading' : 'idle'
  );
  const [result, setResult] = useState<FingerprintResult | null>(null);
  const [progress, setProgress] = useState<ScanProgressState>(
    INITIAL_SCAN_PROGRESS
  );
  const runId = useRef(0);

  const scan = useCallback(async () => {
    const currentRun = ++runId.current;
    setStatus('loading');
    setProgress(INITIAL_SCAN_PROGRESS);
    try {
      const { collectFingerprint } = await import('@creepjs/core');
      if (runId.current !== currentRun) return;
      const next = await collectFingerprint({
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
      setResult(next);
      setStatus('ready');
      trackEvent('tool_run', {
        tool: 'fingerprint_scan',
        surface: 'home',
        outcome: 'success',
      });
    } catch (error) {
      if (runId.current !== currentRun) return;
      console.error('Local fingerprint scan failed:', error);
      setStatus('error');
      trackEvent('tool_run', {
        tool: 'fingerprint_scan',
        surface: 'home',
        outcome: 'error',
      });
    }
  }, []);

  useEffect(() => {
    const cancel = autoStart ? scheduleIdle(() => void scan()) : undefined;
    return () => {
      cancel?.();
      runId.current += 1;
    };
  }, [autoStart, scan]);

  return { status, result, progress, scan };
}
