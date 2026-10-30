'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { collectFingerprint, type FingerprintResult } from '@creepjs/core';
import { trackEvent } from '@/lib/analytics';
import {
  fetchBaseline,
  type BaselineResponse,
} from '@/lib/uniqueness-baseline';
import type {
  CollectionProgress,
  FingerprintScanStatus,
} from '@/components/checker/types';
import {
  INITIAL_SCAN_PROGRESS,
  reduceScanProgress,
  type ScanProgressState,
} from '@/components/checker/scanProgressState';
import { scheduleIdle } from '@/lib/schedule-idle';

export interface FingerprintScan {
  fingerprint: FingerprintResult | null;
  baseline: BaselineResponse | null;
  progress: CollectionProgress;
  status: FingerprintScanStatus;
  error: string | null;
  scan: () => Promise<void>;
  baselineStatus: 'idle' | 'loading' | 'ready' | 'error';
  compareBaseline: () => Promise<void>;
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
  const [baselineStatus, setBaselineStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const baselineRequest = useRef<AbortController | null>(null);

  const scan = useCallback(async () => {
    const currentRun = ++runId.current;
    setStatus('loading');
    setError(null);
    setBaseline(null);
    baselineRequest.current?.abort();
    setBaselineStatus('idle');
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

      trackEvent('tool_run', {
        tool: 'fingerprint_scan',
        surface: 'checker',
        outcome: 'success',
      });
    } catch (scanError) {
      if (runId.current !== currentRun) return;
      console.error('Error collecting fingerprint:', scanError);
      trackEvent('tool_run', {
        tool: 'fingerprint_scan',
        surface: 'checker',
        outcome: 'error',
      });
      setError(
        'Fingerprint collection failed. Your browser may block a required API.'
      );
      setStatus('error');
    }
  }, []);

  const compareBaseline = useCallback(async () => {
    if (!fingerprint || status !== 'ready') return;
    baselineRequest.current?.abort();
    const controller = new AbortController();
    baselineRequest.current = controller;
    const currentRun = runId.current;
    setBaselineStatus('loading');
    try {
      const response = await fetchBaseline(fingerprint, controller.signal);
      if (controller.signal.aborted || currentRun !== runId.current) return;
      setBaseline(response);
      setBaselineStatus(response ? 'ready' : 'error');
    } catch {
      if (!controller.signal.aborted && currentRun === runId.current)
        setBaselineStatus('error');
    }
  }, [fingerprint, status]);

  useEffect(() => {
    const cancel = scheduleIdle(() => {
      void scan();
    });
    return () => {
      cancel();
      runId.current += 1;
      baselineRequest.current?.abort();
    };
  }, [scan]);

  return {
    fingerprint,
    baseline,
    progress,
    status,
    error,
    scan,
    baselineStatus,
    compareBaseline,
  };
}
