'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FingerprintResult } from '@creepjs/core';
import {
  ArrowLeftRight,
  Calendar,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface FingerprintComparisonProps {
  fingerprint1: FingerprintResult;
  fingerprint2: FingerprintResult;
  onClose: () => void;
}

interface ComparisonItem {
  category: string;
  field: string;
  value1: string | number | null;
  value2: string | number | null;
  changed: boolean;
  changeType?: 'improved' | 'degraded' | 'neutral';
}

export function FingerprintComparison({
  fingerprint1,
  fingerprint2,
  onClose,
}: FingerprintComparisonProps) {
  const comparison = useMemo(() => {
    const items: ComparisonItem[] = [];

    // Basic Info
    items.push({
      category: 'Basic Info',
      field: 'Fingerprint ID',
      value1: fingerprint1.fingerprintId,
      value2: fingerprint2.fingerprintId,
      changed: fingerprint1.fingerprintId !== fingerprint2.fingerprintId,
      changeType:
        fingerprint1.fingerprintId !== fingerprint2.fingerprintId
          ? 'neutral'
          : undefined,
    });

    items.push({
      category: 'Basic Info',
      field: 'Timestamp',
      value1: new Date(fingerprint1.timestamp).toLocaleString(),
      value2: new Date(fingerprint2.timestamp).toLocaleString(),
      changed: true,
      changeType: 'neutral',
    });

    items.push({
      category: 'Basic Info',
      field: 'Coverage',
      value1: `${(fingerprint1.confidence * 100).toFixed(1)}%`,
      value2: `${(fingerprint2.confidence * 100).toFixed(1)}%`,
      changed: fingerprint1.confidence !== fingerprint2.confidence,
      changeType:
        fingerprint2.confidence > fingerprint1.confidence
          ? 'improved'
          : fingerprint2.confidence < fingerprint1.confidence
            ? 'degraded'
            : undefined,
    });

    items.push({
      category: 'Basic Info',
      field: 'Total Collection Time',
      value1: `${(fingerprint1.timings.total ?? 0).toFixed(0)}ms`,
      value2: `${(fingerprint2.timings.total ?? 0).toFixed(0)}ms`,
      changed:
        (fingerprint1.timings.total ?? 0) !== (fingerprint2.timings.total ?? 0),
      changeType:
        (fingerprint2.timings.total ?? 0) < (fingerprint1.timings.total ?? 0)
          ? 'improved'
          : (fingerprint2.timings.total ?? 0) >
              (fingerprint1.timings.total ?? 0)
            ? 'degraded'
            : undefined,
    });

    // Canvas
    if (fingerprint1.data.canvas || fingerprint2.data.canvas) {
      items.push({
        category: 'Canvas',
        field: 'Hash',
        value1: fingerprint1.data.canvas?.hash || 'N/A',
        value2: fingerprint2.data.canvas?.hash || 'N/A',
        changed:
          fingerprint1.data.canvas?.hash !== fingerprint2.data.canvas?.hash,
        changeType:
          fingerprint1.data.canvas?.hash !== fingerprint2.data.canvas?.hash
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'Canvas',
        field: 'Collection Time',
        value1: fingerprint1.timings.canvas
          ? `${fingerprint1.timings.canvas.toFixed(0)}ms`
          : 'N/A',
        value2: fingerprint2.timings.canvas
          ? `${fingerprint2.timings.canvas.toFixed(0)}ms`
          : 'N/A',
        changed: fingerprint1.timings.canvas !== fingerprint2.timings.canvas,
        changeType:
          fingerprint2.timings.canvas && fingerprint1.timings.canvas
            ? fingerprint2.timings.canvas < fingerprint1.timings.canvas
              ? 'improved'
              : 'degraded'
            : undefined,
      });
    }

    // WebGL
    if (fingerprint1.data.webgl || fingerprint2.data.webgl) {
      items.push({
        category: 'WebGL',
        field: 'Vendor',
        value1: fingerprint1.data.webgl?.vendor || 'N/A',
        value2: fingerprint2.data.webgl?.vendor || 'N/A',
        changed:
          fingerprint1.data.webgl?.vendor !== fingerprint2.data.webgl?.vendor,
        changeType:
          fingerprint1.data.webgl?.vendor !== fingerprint2.data.webgl?.vendor
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'WebGL',
        field: 'Renderer',
        value1: fingerprint1.data.webgl?.renderer || 'N/A',
        value2: fingerprint2.data.webgl?.renderer || 'N/A',
        changed:
          fingerprint1.data.webgl?.renderer !==
          fingerprint2.data.webgl?.renderer,
        changeType:
          fingerprint1.data.webgl?.renderer !==
          fingerprint2.data.webgl?.renderer
            ? 'neutral'
            : undefined,
      });
    }

    // Navigator
    if (fingerprint1.data.navigator || fingerprint2.data.navigator) {
      items.push({
        category: 'Navigator',
        field: 'User Agent',
        value1: fingerprint1.data.navigator?.userAgent || 'N/A',
        value2: fingerprint2.data.navigator?.userAgent || 'N/A',
        changed:
          fingerprint1.data.navigator?.userAgent !==
          fingerprint2.data.navigator?.userAgent,
        changeType:
          fingerprint1.data.navigator?.userAgent !==
          fingerprint2.data.navigator?.userAgent
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'Navigator',
        field: 'Platform',
        value1: fingerprint1.data.navigator?.platform || 'N/A',
        value2: fingerprint2.data.navigator?.platform || 'N/A',
        changed:
          fingerprint1.data.navigator?.platform !==
          fingerprint2.data.navigator?.platform,
        changeType:
          fingerprint1.data.navigator?.platform !==
          fingerprint2.data.navigator?.platform
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'Navigator',
        field: 'Languages',
        value1: fingerprint1.data.languages?.flat().join(', ') || 'N/A',
        value2: fingerprint2.data.languages?.flat().join(', ') || 'N/A',
        changed:
          JSON.stringify(fingerprint1.data.languages) !==
          JSON.stringify(fingerprint2.data.languages),
        changeType:
          JSON.stringify(fingerprint1.data.languages) !==
          JSON.stringify(fingerprint2.data.languages)
            ? 'neutral'
            : undefined,
      });
    }

    // Screen
    if (fingerprint1.data.screen || fingerprint2.data.screen) {
      items.push({
        category: 'Screen',
        field: 'Resolution',
        value1: fingerprint1.data.screen
          ? `${fingerprint1.data.screen.width}x${fingerprint1.data.screen.height}`
          : 'N/A',
        value2: fingerprint2.data.screen
          ? `${fingerprint2.data.screen.width}x${fingerprint2.data.screen.height}`
          : 'N/A',
        changed:
          fingerprint1.data.screen?.width !== fingerprint2.data.screen?.width ||
          fingerprint1.data.screen?.height !== fingerprint2.data.screen?.height,
        changeType:
          fingerprint1.data.screen?.width !== fingerprint2.data.screen?.width ||
          fingerprint1.data.screen?.height !== fingerprint2.data.screen?.height
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'Screen',
        field: 'Color Depth',
        value1: fingerprint1.data.screen?.colorDepth
          ? `${fingerprint1.data.screen.colorDepth} bits`
          : 'N/A',
        value2: fingerprint2.data.screen?.colorDepth
          ? `${fingerprint2.data.screen.colorDepth} bits`
          : 'N/A',
        changed:
          fingerprint1.data.screen?.colorDepth !==
          fingerprint2.data.screen?.colorDepth,
        changeType:
          fingerprint1.data.screen?.colorDepth !==
          fingerprint2.data.screen?.colorDepth
            ? 'neutral'
            : undefined,
      });
    }

    // Fonts
    if (fingerprint1.data.fonts || fingerprint2.data.fonts) {
      items.push({
        category: 'Fonts',
        field: 'Detected Count',
        value1: fingerprint1.data.fonts?.count || 0,
        value2: fingerprint2.data.fonts?.count || 0,
        changed:
          fingerprint1.data.fonts?.count !== fingerprint2.data.fonts?.count,
        changeType:
          fingerprint1.data.fonts?.count !== fingerprint2.data.fonts?.count
            ? 'neutral'
            : undefined,
      });
    }

    // Timezone
    if (fingerprint1.data.timezone || fingerprint2.data.timezone) {
      items.push({
        category: 'Timezone',
        field: 'Timezone',
        value1: fingerprint1.data.timezone?.timezone || 'N/A',
        value2: fingerprint2.data.timezone?.timezone || 'N/A',
        changed:
          fingerprint1.data.timezone?.timezone !==
          fingerprint2.data.timezone?.timezone,
        changeType:
          fingerprint1.data.timezone?.timezone !==
          fingerprint2.data.timezone?.timezone
            ? 'neutral'
            : undefined,
      });

      items.push({
        category: 'Timezone',
        field: 'Offset',
        value1: fingerprint1.data.timezone?.timezoneOffset ?? 'N/A',
        value2: fingerprint2.data.timezone?.timezoneOffset ?? 'N/A',
        changed:
          fingerprint1.data.timezone?.timezoneOffset !==
          fingerprint2.data.timezone?.timezoneOffset,
        changeType:
          fingerprint1.data.timezone?.timezoneOffset !==
          fingerprint2.data.timezone?.timezoneOffset
            ? 'neutral'
            : undefined,
      });
    }

    // Audio
    if (fingerprint1.data.audio || fingerprint2.data.audio) {
      items.push({
        category: 'Audio',
        field: 'Hash',
        value1: fingerprint1.data.audio?.hash || 'N/A',
        value2: fingerprint2.data.audio?.hash || 'N/A',
        changed:
          fingerprint1.data.audio?.hash !== fingerprint2.data.audio?.hash,
        changeType:
          fingerprint1.data.audio?.hash !== fingerprint2.data.audio?.hash
            ? 'neutral'
            : undefined,
      });
    }

    // Lies Detection
    if (fingerprint1.data.lies || fingerprint2.data.lies) {
      items.push({
        category: 'Lies Detection',
        field: 'Total Lies',
        value1: fingerprint1.data.lies?.liesCount || 0,
        value2: fingerprint2.data.lies?.liesCount || 0,
        changed:
          fingerprint1.data.lies?.liesCount !==
          fingerprint2.data.lies?.liesCount,
        changeType:
          fingerprint2.data.lies && fingerprint1.data.lies
            ? fingerprint2.data.lies.liesCount <
              fingerprint1.data.lies.liesCount
              ? 'improved'
              : fingerprint2.data.lies.liesCount >
                  fingerprint1.data.lies.liesCount
                ? 'degraded'
                : undefined
            : undefined,
      });
    }

    return items;
  }, [fingerprint1, fingerprint2]);

  const stats = useMemo(() => {
    const totalFields = comparison.length;
    const changedFields = comparison.filter((item) => item.changed).length;
    const improvedFields = comparison.filter(
      (item) => item.changeType === 'improved'
    ).length;
    const degradedFields = comparison.filter(
      (item) => item.changeType === 'degraded'
    ).length;

    return {
      totalFields,
      changedFields,
      unchangedFields: totalFields - changedFields,
      improvedFields,
      degradedFields,
      changePercentage:
        totalFields > 0 ? (changedFields / totalFields) * 100 : 0,
    };
  }, [comparison]);

  // Group by category
  const groupedComparison = useMemo(() => {
    const groups: Record<string, ComparisonItem[]> = {};
    comparison.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [comparison]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Fingerprint Comparison
              </CardTitle>
              <CardDescription>
                Detailed side-by-side comparison of two fingerprint records
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Comparison
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="bg-muted/50 space-y-1 rounded-lg p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                <span>Total Fields</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalFields}</div>
            </div>
            <div className="space-y-1 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Changed</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.changedFields}
              </div>
              <div className="text-muted-foreground text-xs">
                {stats.changePercentage.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unchanged</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.unchangedFields}
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Improved</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.improvedFields}
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Degraded</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.degradedFields}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      {Object.entries(groupedComparison).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.category}-${item.field}-${index}`}
                  className={`rounded-lg border p-4 ${
                    item.changed
                      ? 'border-orange-500/20 bg-orange-500/5'
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Field Name */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{item.field}</div>
                      {item.changed && (
                        <div className="flex items-center gap-2">
                          {item.changeType === 'improved' && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <TrendingUp className="h-3 w-3" />
                              <span>Improved</span>
                            </div>
                          )}
                          {item.changeType === 'degraded' && (
                            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <TrendingDown className="h-3 w-3" />
                              <span>Degraded</span>
                            </div>
                          )}
                          {item.changeType === 'neutral' && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                              <Minus className="h-3 w-3" />
                              <span>Changed</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Values */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          Fingerprint 1 (Older)
                        </div>
                        <div className="break-all font-mono text-sm">
                          {String(item.value1)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          Fingerprint 2 (Newer)
                        </div>
                        <div className="break-all font-mono text-sm">
                          {String(item.value2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
