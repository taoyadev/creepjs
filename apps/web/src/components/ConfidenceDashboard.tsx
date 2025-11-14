'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { CollectorSummary, FingerprintResult } from '@creepjs/core';

interface ConfidenceDashboardProps {
  result: FingerprintResult;
}

interface CategoryStat {
  name: string;
  color: string;
  collectors: string[];
  successful: number;
  failed: number;
  skipped: number;
}

const CATEGORY_CONFIG = [
  {
    name: 'Graphics',
    color: 'hsl(var(--chart-1))',
    collectors: ['canvas', 'webgl', 'svg', 'css', 'textMetrics'],
  },
  {
    name: 'Hardware',
    color: 'hsl(var(--chart-2))',
    collectors: [
      'screen',
      'screenFrame',
      'screenResolution',
      'colorDepth',
      'colorGamut',
      'hardwareConcurrency',
      'deviceMemory',
      'media',
      'touchSupport',
      'monochrome',
      'hdr',
    ],
  },
  {
    name: 'Browser',
    color: 'hsl(var(--chart-3))',
    collectors: [
      'navigator',
      'platform',
      'languages',
      'cookiesEnabled',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'openDatabase',
      'plugins',
      'mimeTypes',
      'pdfViewerEnabled',
      'htmlElement',
      'contentWindow',
    ],
  },
  {
    name: 'System',
    color: 'hsl(var(--chart-4))',
    collectors: [
      'fonts',
      'fontPreferences',
      'timezone',
      'dateTimeLocale',
      'math',
      'architecture',
      'cssMedia',
      'domRect',
      'consoleErrors',
    ],
  },
  {
    name: 'Audio',
    color: 'hsl(var(--chart-5))',
    collectors: ['audio', 'audioBaseLatency'],
  },
  {
    name: 'Accessibility',
    color: 'hsl(var(--primary))',
    collectors: [
      'reducedMotion',
      'reducedTransparency',
      'forcedColors',
      'contrast',
      'invertedColors',
    ],
  },
  {
    name: 'Privacy',
    color: 'hsl(var(--chart-6, 210 90% 60%))',
    collectors: ['resistance', 'domBlockers', 'lies'],
  },
  {
    name: 'Network',
    color: 'hsl(var(--warning))',
    collectors: ['webrtc', 'serviceWorker'],
  },
] as const;

const ensureCoverageStats = (
  result: FingerprintResult,
  collectorEntries: Array<[string, CollectorSummary]>
) => {
  if (result.coverage) {
    return result.coverage;
  }

  if (collectorEntries.length === 0) {
    return { ratio: result.confidence, successful: 0, failed: 0, skipped: 0 };
  }

  const successful = collectorEntries.filter(
    ([, summary]) => summary.status === 'success'
  ).length;
  const failed = collectorEntries.filter(
    ([, summary]) => summary.status === 'error'
  ).length;
  const skipped = collectorEntries.filter(
    ([, summary]) => summary.status === 'skipped'
  ).length;
  const considered = successful + failed;
  return {
    ratio: considered === 0 ? result.confidence : successful / considered,
    successful,
    failed,
    skipped,
  };
};

const resolveCollectorStatus = (
  key: string,
  summaries: Record<string, CollectorSummary> | undefined,
  fingerprintData: Record<string, unknown>
): CollectorSummary['status'] => {
  const summary = summaries?.[key];
  if (summary) {
    return summary.status;
  }
  return fingerprintData[key] !== undefined && fingerprintData[key] !== null
    ? 'success'
    : 'skipped';
};

export function ConfidenceDashboard({ result }: ConfidenceDashboardProps) {
  const { collectors, timings, data } = result;
  const collectorEntries = Object.entries(collectors || {});
  const coverage = React.useMemo(
    () => ensureCoverageStats(result, collectorEntries),
    [result, collectorEntries]
  );
  const coveragePercent = Math.round(coverage.ratio * 100);
  const totalTime =
    typeof timings.total === 'number'
      ? timings.total
      : Object.values(timings).reduce(
          (sum, duration = 0) => (sum || 0) + (duration ?? 0),
          0
        );
  const attemptedCollectors = coverage.successful + coverage.failed;
  const avgPerCollector =
    attemptedCollectors > 0 ? (totalTime || 0) / attemptedCollectors : 0;
  const totalCollectors =
    coverage.successful + coverage.failed + coverage.skipped;

  const dataRecord = data as Record<string, unknown>;
  const categoryStats: CategoryStat[] = CATEGORY_CONFIG.map((category) => {
    const collectors = [...category.collectors];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    collectors.forEach((collectorKey) => {
      const status = resolveCollectorStatus(
        collectorKey,
        collectors as any,
        dataRecord
      );
      if (status === 'success') {
        successful += 1;
      } else if (status === 'error') {
        failed += 1;
      } else {
        skipped += 1;
      }
    });

    return {
      name: category.name,
      color: category.color,
      collectors: collectors,
      successful,
      failed,
      skipped,
    };
  });

  const topSlowCollectors = collectorEntries
    .filter(([, component]) => typeof component.duration === 'number')
    .sort(([, a], [, b]) => (b.duration ?? 0) - (a.duration ?? 0))
    .slice(0, 5)
    .map(([name, component]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      time: component.duration?.toFixed(2) ?? '0',
      status: component.status,
    }));

  const failingCollectors = collectorEntries.filter(
    ([, component]) => component.status === 'error'
  );
  const skippedCollectors = collectorEntries.filter(
    ([, component]) => component.status === 'skipped'
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collector Coverage</CardTitle>
          <CardDescription>
            Real-time breakdown of which signals loaded successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex w-full justify-center md:w-auto">
              <div className="relative h-48 w-48">
                <svg viewBox="0 0 192 192" className="h-full w-full">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    className="opacity-20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke={
                      coveragePercent >= 90
                        ? 'hsl(var(--success))'
                        : coveragePercent >= 70
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--destructive))'
                    }
                    strokeWidth="12"
                    strokeDasharray={`${(coveragePercent / 100) * 552.92} 552.92`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px currentColor)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold">{coveragePercent}%</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Coverage
                  </div>
                </div>
              </div>
            </div>

            <div className="grid w-full flex-1 grid-cols-2 gap-4">
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {coverage.successful}
                </div>
                <div className="text-muted-foreground text-sm">Successful</div>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {coverage.failed}
                </div>
                <div className="text-muted-foreground text-sm">Failed</div>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {coverage.skipped}
                </div>
                <div className="text-muted-foreground text-sm">Skipped</div>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {totalCollectors}
                </div>
                <div className="text-muted-foreground text-sm">
                  Total Collectors
                </div>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {(totalTime || 0).toFixed(0)}ms
                </div>
                <div className="text-muted-foreground text-sm">Total Time</div>
              </div>
              <div className="bg-muted/50 space-y-1 rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">
                  {avgPerCollector.toFixed(0)}ms
                </div>
                <div className="text-muted-foreground text-sm">
                  Avg per Attempted
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Success/failure ratio by signal family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => {
                const total = category.collectors.length;
                const percent =
                  total === 0 ? 0 : (category.successful / total) * 100;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.successful}/{total}
                      </span>
                    </div>
                    <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="text-muted-foreground flex gap-3 text-xs">
                      <span>OK: {category.successful}</span>
                      <span>Failed: {category.failed}</span>
                      <span>Skipped: {category.skipped}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collector Insights</CardTitle>
            <CardDescription>
              Slowest, failing, and skipped collectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 text-sm font-semibold">Slowest</div>
                <div className="space-y-2">
                  {topSlowCollectors.length === 0 && (
                    <div className="text-muted-foreground text-sm">
                      No timing data available
                    </div>
                  )}
                  {topSlowCollectors.map((collector) => (
                    <div
                      key={collector.name}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {collector.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {collector.time}ms
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          collector.status === 'success'
                            ? 'text-green-500'
                            : collector.status === 'error'
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {collector.status === 'success'
                          ? 'OK'
                          : collector.status === 'error'
                            ? 'Error'
                            : 'Skipped'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Failures</div>
                {failingCollectors.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    All collectors succeeded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {failingCollectors.slice(0, 4).map(([name, component]) => (
                      <div key={name} className="rounded-lg border p-2">
                        <div className="text-sm font-medium capitalize">
                          {name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {component.error || 'Unknown error'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Skipped APIs</div>
                {skippedCollectors.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    Nothing was skipped
                  </div>
                ) : (
                  <div className="space-y-2">
                    {skippedCollectors.slice(0, 4).map(([name]) => (
                      <div key={name} className="rounded-lg border p-2">
                        <div className="text-sm font-medium capitalize">
                          {name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          API disabled or unavailable in this browser
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
