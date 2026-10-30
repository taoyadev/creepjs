'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CopyButton } from '@/components/CopyButton';
import { FingerprintGlyph } from '@/components/home/FingerprintGlyph';
import {
  SIGNAL_ROWS,
  describeCoverage,
  describeScanHeadline,
} from '@/components/home/fingerprint-summary';
import { useLazyFingerprintScan } from '@/components/home/useLazyFingerprintScan';
import { trackEvent } from '@/lib/analytics';
import { signalJson } from '@/lib/signal-result';
import { cn } from '@/lib/utils';

/**
 * The homepage's first task: a full local scan that starts once the page is
 * idle. Loading and settled states share one layout so the result does not
 * move the page, and a rerun keeps the last result until it settles.
 */
export function HomeFingerprintScan() {
  const { status, result, progress, scan } = useLazyFingerprintScan({
    autoStart: true,
  });
  const scanning = status === 'loading';
  const failed = status === 'error';
  const completed = new Set(progress.completedCollectors);
  const json = useMemo(() => (result ? signalJson(result.data) : ''), [result]);
  const statusText = scanning
    ? result
      ? 'Scanning again. The previous result stays until it finishes.'
      : 'Scanning this browser…'
    : !failed && result
      ? describeScanHeadline(result)
      : '';

  return (
    <section
      aria-labelledby="home-scan-title"
      className="bg-card text-card-foreground min-w-0 overflow-hidden rounded-xl border shadow-sm"
    >
      <div className="bg-primary/5 flex items-center gap-3 border-b px-5 py-5 sm:gap-5 sm:px-6">
        <FingerprintGlyph
          id={result?.fingerprintId ?? null}
          scanning={scanning}
          className="text-primary h-14 w-14 sm:h-20 sm:w-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-h-11 items-center justify-between gap-2">
            <h2
              id="home-scan-title"
              className="text-muted-foreground text-sm font-medium"
            >
              Your fingerprint ID
            </h2>
            {result && (
              <CopyButton
                value={result.fingerprintId}
                ariaLabel="Copy fingerprint ID"
                successMessage="Fingerprint ID copied"
                onCopied={() =>
                  trackEvent('fingerprint_copied', { surface: 'home' })
                }
              />
            )}
          </div>
          <div className="flex min-h-8 items-center">
            {result ? (
              <code
                id="home-fingerprint-id"
                className="min-w-0 break-all font-mono text-base font-semibold leading-tight sm:text-2xl"
              >
                {result.fingerprintId}
              </code>
            ) : (
              <>
                <span
                  className="bg-primary/10 block h-7 w-full max-w-[17rem] animate-pulse rounded-md"
                  aria-hidden="true"
                />
                <span className="sr-only">
                  The ID appears when the scan finishes.
                </span>
              </>
            )}
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            Derived from this browser&apos;s setup, without cookies. It is not a
            uniqueness score.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p
            role="status"
            className={cn('text-sm font-semibold', !statusText && 'sr-only')}
          >
            {statusText}
          </p>
          {failed ? (
            <div role="alert" className="space-y-1">
              <p className="text-destructive text-sm font-semibold">
                {result
                  ? 'The new scan could not finish.'
                  : 'The scan could not finish.'}
              </p>
              <p className="text-muted-foreground text-xs leading-5">
                {result ? 'The previous result is still shown. ' : ''}A privacy
                setting or an unsupported browser API may have stopped it. Run
                it again or open the full report.
              </p>
            </div>
          ) : (
            <div className="mt-2 min-h-10">
              {scanning ? (
                <div className="space-y-1.5">
                  <Progress
                    label="Fingerprint scan progress"
                    value={progress.current}
                    max={progress.total}
                  />
                  <p
                    className="text-muted-foreground flex justify-between gap-4 text-xs"
                    aria-hidden="true"
                  >
                    <span className="truncate">
                      {progress.total > 1
                        ? progress.currentCollector
                        : 'Loading the collectors'}
                    </span>
                    {progress.total > 1 && (
                      <span className="shrink-0 tabular-nums">
                        {progress.current} / {progress.total}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                result && (
                  <p className="text-muted-foreground text-xs leading-5">
                    {describeCoverage(result)}
                  </p>
                )
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => void scan()}
          disabled={scanning}
        >
          <RefreshCw
            className={cn(
              'mr-2 h-4 w-4',
              scanning && 'motion-safe:animate-spin'
            )}
            aria-hidden="true"
          />
          {scanning ? 'Scanning' : 'Run again'}
        </Button>
      </div>

      <dl aria-busy={scanning} className="bg-border grid gap-px sm:grid-cols-2">
        {SIGNAL_ROWS.map((row) => {
          const pending = !result && !failed;
          const value = result ? row.read(result.data) : null;
          const collected =
            scanning && row.collectors.every((key) => completed.has(key));
          return (
            <div key={row.key} className="bg-card min-w-0 px-5 py-3 sm:px-6">
              <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
                {row.label}
                {collected && (
                  <Check
                    className="text-success h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                )}
              </dt>
              <dd className="mt-1 min-h-5 text-sm font-medium leading-5 [overflow-wrap:anywhere]">
                {pending ? (
                  <>
                    <span
                      className="bg-muted block h-5 w-2/3 animate-pulse rounded"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Waiting for the scan</span>
                  </>
                ) : (
                  (value ?? (
                    <span className="text-muted-foreground font-normal">
                      Not returned
                    </span>
                  ))
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Button asChild>
          <Link href="/checker">
            Open the full report
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Link
          href="/fingerprint"
          className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          What each signal means
        </Link>
      </div>

      <details className="border-t">
        <summary className="cursor-pointer px-5 py-3 text-sm font-medium sm:px-6">
          Inspect all collected values
        </summary>
        {json ? (
          <>
            <pre
              role="region"
              aria-label="All collected values"
              tabIndex={0}
              className="bg-muted max-h-72 max-w-full overflow-auto px-5 py-3 text-xs sm:px-6"
            >
              <code>{json}</code>
            </pre>
            <div className="px-5 py-3 sm:px-6">
              <CopyButton
                value={json}
                label="Copy collector JSON"
                variant="outline"
              />
            </div>
          </>
        ) : (
          <p className="text-muted-foreground px-5 pb-4 text-sm sm:px-6">
            The values appear here when the scan finishes.
          </p>
        )}
      </details>
    </section>
  );
}
