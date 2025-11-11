'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FingerprintResult } from '@creepjs/core';

interface ConfidenceDashboardProps {
  result: FingerprintResult;
}

interface CategoryStats {
  name: string;
  total: number;
  successful: number;
  color: string;
}

const hasValue = <T,>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export function ConfidenceDashboard({ result }: ConfidenceDashboardProps) {
  const { confidence, timings, data, collectors } = result;
  const confidencePercent = Math.round(confidence * 100);
  const collectorEntries = Object.entries(collectors || {});

  // Calculate category statistics
  const categories: CategoryStats[] = [
    {
      name: 'Graphics',
      total: 5,
      successful: [data.canvas, data.webgl, data.svg, data.css, data.textMetrics].filter(hasValue).length,
      color: 'hsl(var(--chart-1))',
    },
    {
      name: 'System',
      total: 5,
      successful: [data.navigator, data.screen, data.fonts, data.math, data.htmlElement].filter(hasValue).length,
      color: 'hsl(var(--chart-2))',
    },
    {
      name: 'Media',
      total: 5,
      successful: [data.audio, data.media, data.voices, data.clientRects, data.domRect].filter(hasValue).length,
      color: 'hsl(var(--chart-3))',
    },
    {
      name: 'Network',
      total: 5,
      successful: [data.webrtc, data.serviceWorker, data.mimeTypes, data.contentWindow, data.cssMedia].filter(hasValue)
        .length,
      color: 'hsl(var(--chart-4))',
    },
    {
      name: 'Security',
      total: 4,
      successful: [data.lies, data.resistance, data.timezone, data.consoleErrors].filter(hasValue).length,
      color: 'hsl(var(--chart-5))',
    },
    {
      name: 'Accessibility',
      total: 6,
      successful: [
        data.colorGamut,
        data.contrast,
        data.forcedColors,
        data.reducedMotion,
        data.reducedTransparency,
        data.hdr,
      ].filter(hasValue).length,
      color: 'hsl(var(--primary))',
    },
  ];

  // Timing statistics
  const topSlowCollectors = collectorEntries
    .filter(([, component]) => typeof component.duration === 'number')
    .sort(([, a], [, b]) => (b.duration ?? 0) - (a.duration ?? 0))
    .slice(0, 5)
    .map(([name, component]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      time: component.duration?.toFixed(2) ?? '0',
      status: component.status,
    }));
  const failingCollectors = collectorEntries.filter(([, component]) => component.status === 'error');

  // Calculate overall success rate
  const totalCollectors = categories.reduce((sum, cat) => sum + cat.total, 0);
  const successfulCollectors = categories.reduce((sum, cat) => sum + cat.successful, 0);
  const totalTime = typeof timings.total === 'number' ? timings.total : 0;
  const avgPerCollector = successfulCollectors > 0 ? totalTime / successfulCollectors : 0;

  return (
    <div className="space-y-6">
      {/* Overall Confidence Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Fingerprint Confidence Score</CardTitle>
          <CardDescription>Overall quality and completeness of your browser fingerprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Circular Progress */}
            <div className="relative flex-shrink-0">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  className="opacity-20"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={
                    confidencePercent >= 90
                      ? 'hsl(var(--success))'
                      : confidencePercent >= 70
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--destructive))'
                  }
                  strokeWidth="12"
                  strokeDasharray={`${(confidencePercent / 100) * 552.92} 552.92`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 8px currentColor)',
                  }}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{confidencePercent}%</div>
                <div className="text-sm text-muted-foreground mt-1">Confidence</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{successfulCollectors}</div>
                <div className="text-sm text-muted-foreground">Successful Collectors</div>
              </div>
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalCollectors}</div>
                <div className="text-sm text-muted-foreground">Total Collectors</div>
              </div>
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalTime.toFixed(0)}ms</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{avgPerCollector.toFixed(0)}ms</div>
                <div className="text-sm text-muted-foreground">Avg per Collector</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Success rate by collector category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const percent = (category.successful / category.total) * 100;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.successful}/{category.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Collector Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Collector Insights</CardTitle>
            <CardDescription>Slowest and failing collectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-semibold mb-2">Slowest</div>
                <div className="space-y-2">
                  {topSlowCollectors.length === 0 && (
                    <div className="text-sm text-muted-foreground">No timing data available</div>
                  )}
                  {topSlowCollectors.map((collector, index) => (
                    <div key={collector.name} className="flex items-center justify-between rounded-lg border p-2">
                      <div>
                        <div className="text-sm font-medium">{collector.name}</div>
                        <div className="text-xs text-muted-foreground">{collector.time}ms</div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          collector.status === 'success' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {collector.status === 'success' ? 'OK' : 'Error'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Failures</div>
                {failingCollectors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">All collectors succeeded</div>
                ) : (
                  <div className="space-y-2">
                    {failingCollectors.slice(0, 4).map(([name, component]) => (
                      <div key={name} className="rounded-lg border p-2">
                        <div className="text-sm font-medium capitalize">{name}</div>
                        <div className="text-xs text-muted-foreground">{component.error || 'Unknown error'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Fingerprint Quality Indicators</CardTitle>
          <CardDescription>Assessment of fingerprint reliability and uniqueness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Completeness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    confidencePercent >= 90
                      ? 'bg-green-500'
                      : confidencePercent >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
                <h4 className="font-semibold">Completeness</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {confidencePercent >= 90
                  ? 'Excellent: All major collectors succeeded'
                  : confidencePercent >= 70
                    ? 'Good: Most collectors succeeded'
                    : 'Limited: Several collectors failed'}
              </p>
            </div>

            {/* Stability */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    data.lies && data.lies.totalLies === 0
                      ? 'bg-green-500'
                      : data.lies && data.lies.totalLies <= 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
                <h4 className="font-semibold">Stability</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.lies && data.lies.totalLies === 0
                  ? 'Stable: No inconsistencies detected'
                  : data.lies && data.lies.totalLies <= 3
                    ? 'Minor: Few inconsistencies found'
                    : 'Unstable: Multiple inconsistencies detected'}
              </p>
            </div>

            {/* Performance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    timings.total < 1000 ? 'bg-green-500' : timings.total < 2000 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <h4 className="font-semibold">Performance</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {timings.total < 1000
                  ? 'Fast: Completed in under 1 second'
                  : timings.total < 2000
                    ? 'Normal: Completed in 1-2 seconds'
                    : 'Slow: Took over 2 seconds'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
