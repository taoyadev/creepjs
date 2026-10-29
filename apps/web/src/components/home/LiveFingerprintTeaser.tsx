'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Fingerprint, Play, RefreshCw } from 'lucide-react';
import type { FingerprintResult } from '@creepjs/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CopyButton } from '@/components/CopyButton';
import {
  INITIAL_SCAN_PROGRESS,
  reduceScanProgress,
} from '@/components/checker/scanProgressState';
import { trackEvent } from '@/lib/analytics';
import { signalJson } from '@/lib/signal-result';

type TeaserStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Homepage scan, run only when the visitor asks for it. The collectors load
 * on demand, so they stay out of the homepage bundle, and the WebRTC check
 * (which contacts a public STUN server) never runs on a plain page view.
 */
export function LiveFingerprintTeaser() {
  const [status, setStatus] = useState<TeaserStatus>('idle');
  const [result, setResult] = useState<FingerprintResult | null>(null);
  const [progress, setProgress] = useState(INITIAL_SCAN_PROGRESS);
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
      console.error('Homepage fingerprint teaser failed:', error);
      setStatus('error');
      trackEvent('tool_run', {
        tool: 'fingerprint_scan',
        surface: 'home',
        outcome: 'error',
      });
    }
  }, []);

  useEffect(
    () => () => {
      // Drop the result of a scan still running when the card unmounts.
      runId.current += 1;
    },
    []
  );

  return (
    <Card className="flex min-h-[22rem] flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-primary mb-1 text-xs font-semibold uppercase tracking-wider">
              Browser evidence
            </p>
            <CardTitle as="h2" className="flex items-center gap-2 text-xl">
              <Fingerprint className="h-5 w-5" aria-hidden="true" />
              Live fingerprint
            </CardTitle>
          </div>
          {(status === 'ready' || status === 'error') && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void scan()}
              aria-label="Run fingerprint teaser again"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-6">
        {status === 'idle' && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm leading-6">
              Run browser checks locally and see the identifier this browser
              produces. The results stay on this page. One check, WebRTC,
              contacts a public STUN server to see which network addresses your
              browser exposes.
            </p>
            <Button type="button" onClick={() => void scan()}>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              Run local scan
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div
            className="space-y-5"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.currentCollector}
                </span>
                <span className="font-medium">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress
                label="Homepage fingerprint collection progress"
                value={progress.current}
                max={progress.total}
              />
            </div>
            <div aria-hidden="true" className="space-y-3">
              <div className="bg-muted h-10 animate-pulse rounded-md" />
              <div className="bg-muted h-16 animate-pulse rounded-md" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4" role="alert">
            <p className="font-semibold">The local scan could not complete.</p>
            <p className="text-muted-foreground text-sm leading-6">
              A privacy setting or unsupported API may have interrupted
              collection. The rest of CreepJS remains available.
            </p>
            <Button type="button" variant="outline" onClick={() => void scan()}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && result && (
          <div className="space-y-5">
            <p role="status" className="text-sm font-semibold">
              {result.coverage.successful === 0
                ? 'No usable collector values returned'
                : result.coverage.failed || result.coverage.skipped
                  ? 'Scan finished with partial coverage'
                  : 'Scan complete'}{' '}
              · {result.coverage.successful} returned, {result.coverage.failed}{' '}
              failed, {result.coverage.skipped} unavailable
            </p>
            <div>
              <p className="text-muted-foreground text-xs">Diagnostic ID</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="bg-muted min-w-0 flex-1 truncate rounded-md px-3 py-2 font-mono text-sm font-bold">
                  {result.fingerprintId}
                </code>
                <CopyButton
                  value={result.fingerprintId}
                  ariaLabel="Copy homepage fingerprint ID"
                  successMessage="Fingerprint ID copied"
                  onCopied={() =>
                    trackEvent('fingerprint_copied', { surface: 'home' })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Coverage</p>
                <p className="mt-1 text-2xl font-bold">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Collection time</p>
                <p className="mt-1 text-2xl font-bold">
                  {Math.round(result.timings.total ?? 0)}
                  <span className="text-muted-foreground ml-1 text-xs">ms</span>
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              Coverage measures completed collectors; it is not a uniqueness
              score.
            </p>
            <dl className="space-y-2 text-sm">
              {[
                ['Browser platform', result.data.navigator?.platform],
                [
                  'Graphics renderer',
                  result.data.webgl?.unmaskedRenderer ??
                    result.data.webgl?.renderer,
                ],
                ['Timezone', result.data.timezone?.timezone],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[0.7fr_1.3fr] gap-3 border-t pt-2"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words [overflow-wrap:anywhere]">
                    {value || 'Not returned'}
                  </dd>
                </div>
              ))}
            </dl>
            <details className="rounded-lg border">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Inspect all collected values
              </summary>
              <pre
                className="bg-muted max-h-64 max-w-full overflow-auto p-3 text-xs"
                tabIndex={0}
                aria-label="Homepage collected values"
              >
                <code>{signalJson(result.data)}</code>
              </pre>
              <div className="p-2">
                <CopyButton
                  value={signalJson(result.data)}
                  label="Copy collector JSON"
                  variant="outline"
                />
              </div>
            </details>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href="/checker">
            Open the full checker
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
