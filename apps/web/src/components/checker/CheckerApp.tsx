'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/CopyButton';
import { collectorTabs, type CollectorTabKey } from '@creepjs/core';
import { RefreshCw } from 'lucide-react';
import { RiskBadge } from '@/components/FingerprintCollectorCard';
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

const PrivacyLeakageAssessment = dynamic(
  () =>
    import('@/components/PrivacyLeakageAssessment').then(
      (mod) => mod.PrivacyLeakageAssessment
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Privacy Leakage Assessment" />,
  }
);

const BrowserComparison = dynamic(
  () =>
    import('@/components/BrowserComparison').then(
      (mod) => mod.BrowserComparison
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Browser Comparison" />,
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
  const { fingerprint, baseline, progress, status, error, scan } =
    useFingerprintScan();
  const { tab, snapshot, setTab, buildSnapshotUrl } = useCheckerUrlState();
  const ownIp = useOwnIp();
  const loading = status === 'loading';

  if (status !== 'ready' || !fingerprint) {
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

  return (
    <Suspense fallback={<ReportLoadingFallback />}>
      <div className="animate-fade-in-up space-y-6 md:space-y-8">
        <SharedResultBanner
          snapshot={snapshot}
          currentFingerprintId={fingerprint.fingerprintId}
        />
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void scan()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh Fingerprint
          </Button>
        </div>
        {/* Fingerprint ID Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3">
              <span>Fingerprint ID</span>
              <div className="flex items-center gap-3">
                <RiskBadge
                  level={
                    fingerprint.confidence >= 0.8
                      ? 'low'
                      : fingerprint.confidence >= 0.6
                        ? 'medium'
                        : 'high'
                  }
                  label={`Coverage: ${(fingerprint.confidence * 100).toFixed(1)}%`}
                />
                <span className="text-foreground/80 text-sm font-normal">
                  Total Time: {fingerprint.timings.total?.toFixed(2)}ms
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <code className="flex-1 break-all font-mono text-lg font-bold">
                {fingerprint.fingerprintId}
              </code>
              <div className="flex items-center gap-2">
                <CopyButton
                  value={fingerprint.fingerprintId}
                  variant="outline"
                  size="icon"
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
            </div>
          </CardContent>
        </Card>

        {/* Coverage Dashboard */}
        <ConfidenceDashboard result={fingerprint} baseline={baseline} />

        <NetworkTrustReport
          result={fingerprint}
          ownIp={ownIp}
          onRetryIp={() => void ownIp.refresh()}
        />

        {/* Uniqueness Analysis */}
        <UniquenessAnalysis baseline={baseline} />

        {/* Privacy Leakage Assessment */}
        <PrivacyLeakageAssessment result={fingerprint} />

        {/* Browser Comparison & Recommendations */}
        <BrowserComparison result={fingerprint} />

        {/* Fingerprint History */}
        <FingerprintHistory currentResult={fingerprint} />

        {/* Export Report */}
        <ExportReport
          result={fingerprint}
          ipSummary={ownIp.status === 'ready' ? ownIp.data : undefined}
        />

        {/* Collectors Tabs */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as CollectorTabKey)}
          className="w-full"
        >
          <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
            {collectorTabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {collectorTabs.map(({ key: tabKey }) => (
            <TabsContent key={tabKey} value={tabKey} className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tabCollectors[tabKey].map(({ key, tab }) =>
                  renderCollectorCard[tab](key, fingerprint, baseline)
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Suspense>
  );
}
