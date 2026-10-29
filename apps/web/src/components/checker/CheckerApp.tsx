'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/CopyButton';
import { collectorTabs, type CollectorTabKey } from '@creepjs/core';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { trackEvent } from '@/lib/analytics';
import { ScanProgress } from '@/components/checker/ScanProgress';
import { SharedResultBanner } from '@/components/checker/SharedResultBanner';
import { useFingerprintScan } from '@/components/checker/hooks/useFingerprintScan';
import { useCheckerUrlState } from '@/components/checker/hooks/useCheckerUrlState';
import { useOwnIp } from '@/components/checker/hooks/useOwnIp';
import { NetworkTrustReport } from '@/components/checker/NetworkTrustReport';
import type { ExportReportProps } from '@/components/ExportReport';
import {
  renderCollectorCard,
  tabCollectors,
} from '@/components/checker/cards/renderCollectorCard';

const PanelSkeleton = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
        <div className="bg-muted h-24 w-full animate-pulse rounded" />
      </div>
    </CardContent>
  </Card>
);

const ReportLoadingFallback = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Preparing fingerprint report"
    className="space-y-6"
  >
    <span className="sr-only">Preparing fingerprint report</span>
    <PanelSkeleton title="Fingerprint report" />
    <div className="grid gap-6 md:grid-cols-2">
      <PanelSkeleton title="Coverage Dashboard" />
      <PanelSkeleton title="Network Trust Report" />
    </div>
  </div>
);

const ConfidenceDashboard = dynamic(
  () =>
    import('@/components/ConfidenceDashboard').then(
      (mod) => mod.ConfidenceDashboard
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Coverage Dashboard" />,
  }
);

const UniquenessAnalysis = dynamic(
  () =>
    import('@/components/UniquenessAnalysis').then(
      (mod) => mod.UniquenessAnalysis
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Uniqueness Analysis" />,
  }
);

const FingerprintHistory = dynamic(
  () =>
    import('@/components/FingerprintHistory').then(
      (mod) => mod.FingerprintHistory
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Fingerprint History" />,
  }
);

const ExportReport = dynamic<ExportReportProps>(
  () => import('@/components/ExportReport').then((mod) => mod.ExportReport),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Export Report" />,
  }
);

export function CheckerApp() {
  const {
    fingerprint,
    baseline,
    baselineStatus,
    compareBaseline,
    progress,
    status,
    error,
    scan,
  } = useFingerprintScan();
  const { tab, snapshot, setTab, buildSnapshotUrl } = useCheckerUrlState();
  const ownIp = useOwnIp();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const loading = status === 'loading';

  if (!fingerprint) {
    return (
      <div className="space-y-4">
        <SharedResultBanner snapshot={snapshot} />
        <ScanProgress
          status={status === 'error' ? 'error' : 'loading'}
          progress={progress}
          error={error}
          onRetry={() => void scan()}
        />
      </div>
    );
  }

  const shareUrl = buildSnapshotUrl({
    fingerprintId: fingerprint.fingerprintId,
    coverage: fingerprint.confidence * 100,
    baselineCount: baseline?.totalSamples ?? null,
  });
  const coverage = fingerprint.coverage;

  return (
    <Suspense fallback={<ReportLoadingFallback />}>
      <div className="space-y-5">
        <SharedResultBanner
          snapshot={snapshot}
          currentFingerprintId={fingerprint.fingerprintId}
        />
        <Card className="bg-primary/5 border-primary/20" aria-busy={loading}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Fingerprint ID</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void scan()}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                {loading ? 'Scanning…' : 'Refresh Fingerprint'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <code className="min-w-0 flex-1 break-all font-mono text-lg font-bold">
                {fingerprint.fingerprintId}
              </code>
              <CopyButton
                value={fingerprint.fingerprintId}
                variant="outline"
                ariaLabel="Copy fingerprint ID"
                successMessage="Fingerprint ID copied"
                onCopied={() =>
                  trackEvent('fingerprint_copied', { surface: 'checker' })
                }
              />
              <CopyButton
                value={shareUrl}
                label="Copy share link"
                variant="outline"
                disabled={!shareUrl}
                successMessage="Snapshot link copied"
              />
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Coverage', `${(fingerprint.confidence * 100).toFixed(1)}%`],
                ['Returned', String(coverage.successful)],
                [
                  'Failed / unavailable',
                  `${coverage.failed} / ${coverage.skipped}`,
                ],
                [
                  'Collection time',
                  `${Math.round(fingerprint.timings.total ?? 0)} ms`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-background rounded-lg border p-3"
                >
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="mt-1 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground text-xs leading-5">
              Coverage is completion, not uniqueness or trust. The share link
              contains the diagnostic ID and summary, not the full report. Local
              collection finished{' '}
              {new Date(fingerprint.timestamp).toLocaleTimeString()}.
            </p>
            {(coverage.failed > 0 || coverage.skipped > 0) && (
              <p className="text-sm" role="status">
                Partial coverage: inspect unavailable and failed cards below.
                Browser support and privacy settings can limit what is returned.
              </p>
            )}
            {loading && (
              <div role="status" className="text-sm">
                Refreshing {progress.current} / {progress.total} ·{' '}
                {progress.currentCollector}. The previous report stays available
                until the new scan finishes.
              </div>
            )}
            {status === 'error' && (
              <p role="alert" className="text-destructive text-sm">
                {error} The previous report is still shown. Use Refresh
                Fingerprint to retry.
              </p>
            )}
            <nav
              aria-label="Report actions"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
            >
              <a
                href="#collector-results"
                className="text-primary underline underline-offset-4"
              >
                Inspect signals
              </a>
              <a
                href="#history"
                className="text-primary underline underline-offset-4"
              >
                Compare local scans
              </a>
              <a
                href="#export-report"
                className="text-primary underline underline-offset-4"
              >
                Export report
              </a>
            </nav>
          </CardContent>
        </Card>

        <section
          id="collector-results"
          className="section-anchor space-y-3"
          aria-label="Collector results"
        >
          <h2 className="text-xl font-semibold">Observed browser signals</h2>
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as CollectorTabKey)}
            className="w-full"
          >
            <TabsList
              aria-label="Filter collector results"
              className="flex h-auto w-full justify-start overflow-x-auto"
            >
              {collectorTabs.map((entry) => (
                <TabsTrigger
                  key={entry.key}
                  value={entry.key}
                  className="min-h-10 shrink-0"
                >
                  {entry.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {collectorTabs.map(({ key: tabKey }) => (
              <TabsContent key={tabKey} value={tabKey} className="mt-4">
                <div className="collector-grid grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                  {tabCollectors[tabKey].map(({ key, tab: cardTab }) =>
                    renderCollectorCard[cardTab](key, fingerprint, baseline)
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <NetworkTrustReport
          result={fingerprint}
          ownIp={ownIp}
          onRetryIp={() => void ownIp.refresh()}
        />
        <section
          className="space-y-3 rounded-xl border p-5"
          aria-labelledby="population-title"
        >
          <h2 id="population-title" className="text-lg font-semibold">
            Optional population comparison
          </h2>
          <p className="text-muted-foreground text-sm leading-6">
            Compare a Canvas hash, WebGL renderer, timezone, font count, and
            screen tuple with the CreepJS API. These values leave this browser
            only when you request this comparison. Small groups remain
            suppressed.
          </p>
          {baselineStatus !== 'ready' && (
            <Button
              type="button"
              variant="outline"
              disabled={baselineStatus === 'loading' || loading}
              onClick={() => void compareBaseline()}
            >
              {baselineStatus === 'loading'
                ? 'Loading population context…'
                : baselineStatus === 'error'
                  ? 'Retry population comparison'
                  : 'Compare with population'}
            </Button>
          )}
          {baselineStatus === 'error' && (
            <p role="alert" className="text-destructive text-sm">
              Population context is unavailable. Your local report is complete
              and remains usable.
            </p>
          )}
          {baselineStatus === 'loading' && (
            <p role="status" className="text-muted-foreground text-sm">
              Requesting the optional comparison…
            </p>
          )}
          {baselineStatus === 'ready' && (
            <UniquenessAnalysis baseline={baseline} />
          )}
        </section>
        <details
          className="rounded-xl border p-5"
          onToggle={(event) => setAnalysisOpen(event.currentTarget.open)}
        >
          <summary className="cursor-pointer font-semibold">
            Inspect collection coverage
          </summary>
          {analysisOpen && (
            <div className="space-y-5 pt-4">
              <ConfidenceDashboard result={fingerprint} baseline={baseline} />
            </div>
          )}
        </details>
        <section id="history" className="section-anchor">
          <FingerprintHistory currentResult={fingerprint} />
        </section>
        <section id="export-report" className="section-anchor">
          <ExportReport
            result={fingerprint}
            ipSummary={ownIp.status === 'ready' ? ownIp.data : undefined}
          />
        </section>
      </div>
    </Suspense>
  );
}
