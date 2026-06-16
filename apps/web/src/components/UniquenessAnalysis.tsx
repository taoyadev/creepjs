'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { FingerprintResult } from '@creepjs/core';
import { Shield, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  type BaselineEstimate,
  type BaselineResponse,
  fetchBaseline,
  labelForBaselineComponent,
} from '@/lib/uniqueness-baseline';

interface UniquenessAnalysisProps {
  result: FingerprintResult;
}

interface StoredFingerprint {
  id: string;
  timestamp: number;
  data: Record<string, string>;
}

function isStoredFingerprint(value: unknown): value is StoredFingerprint {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.timestamp !== 'number') {
    return false;
  }
  if (!record.data || typeof record.data !== 'object') {
    return false;
  }
  const data = record.data as Record<string, unknown>;
  return Object.values(data).every((v) => typeof v === 'string');
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

interface UniquenessMetrics {
  totalStored: number;
  exactMatches: number;
  partialMatches: number;
  uniquenessScore: number;
  featureScores: Array<{
    name: string;
    uniqueness: number;
    matchRate: number;
  }>;
  mostUniqueFeatures: Array<{ name: string; uniqueness: number }>;
  commonFeatures: Array<{ name: string; matchRate: number }>;
}

export function UniquenessAnalysis({ result }: UniquenessAnalysisProps) {
  const [metrics, setMetrics] = useState<UniquenessMetrics | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);

  useEffect(() => {
    const analyzeUniqueness = () => {
      // Get stored fingerprints from localStorage
      const storedData = localStorage.getItem('creepjs_fingerprints');
      const parsed: unknown = storedData ? JSON.parse(storedData) : [];
      const stored: StoredFingerprint[] = isUnknownArray(parsed)
        ? parsed.filter(isStoredFingerprint)
        : [];

      // Current fingerprint features
      const currentFeatures: Record<string, string> = {
        canvas: result.data.canvas?.hash || 'none',
        webgl: result.data.webgl?.renderer || 'none',
        navigator: result.data.navigator?.userAgent || 'none',
        screen:
          typeof result.data.screen?.width === 'number' &&
          typeof result.data.screen?.height === 'number'
            ? `${result.data.screen.width}x${result.data.screen.height}`
            : 'none',
        fonts: String(result.data.fonts?.count || 0),
        timezone: result.data.timezone?.timezone || 'none',
        audio: result.data.audio?.hash || 'none',
        webrtc: result.data.webrtc?.hash || 'none',
        lies: String(result.data.lies?.liesCount || 0),
      };

      // Store current fingerprint
      stored.push({
        id: result.fingerprintId,
        timestamp: result.timestamp,
        data: currentFeatures,
      });

      // Keep only last 100 fingerprints
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }

      localStorage.setItem('creepjs_fingerprints', JSON.stringify(stored));

      // Calculate metrics
      let exactMatches = 0;
      let partialMatches = 0;

      const featureMatchCounts: Record<string, number> = {};
      Object.keys(currentFeatures).forEach((key) => {
        featureMatchCounts[key] = 0;
      });

      // Compare with stored fingerprints (excluding current)
      const previousFingerprints = stored.slice(0, -1);

      if (previousFingerprints.length === 0) {
        setIsFirstVisit(true);
      }

      previousFingerprints.forEach((fp) => {
        let matchingFeatures = 0;
        const totalFeatures = Object.keys(currentFeatures).length;

        Object.keys(currentFeatures).forEach((key) => {
          if (fp.data[key] === currentFeatures[key]) {
            matchingFeatures++;
            featureMatchCounts[key]++;
          }
        });

        const matchRate = matchingFeatures / totalFeatures;

        if (matchRate === 1.0) {
          exactMatches++;
        } else if (matchRate >= 0.5) {
          partialMatches++;
        }
      });

      // Calculate uniqueness for each feature
      const featureUniqueness = Object.entries(featureMatchCounts).map(
        ([name, matches]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          uniqueness:
            previousFingerprints.length > 0
              ? 1 - matches / previousFingerprints.length
              : 1.0,
          matchRate:
            previousFingerprints.length > 0
              ? matches / previousFingerprints.length
              : 0,
        })
      );

      // Sort by uniqueness (most unique first)
      const mostUniqueFeatures = [...featureUniqueness]
        .sort((a, b) => b.uniqueness - a.uniqueness)
        .slice(0, 5)
        .map(({ name, uniqueness }) => ({ name, uniqueness }));

      // Sort by match rate (most common first)
      const commonFeatures = [...featureUniqueness]
        .sort((a, b) => b.matchRate - a.matchRate)
        .slice(0, 5)
        .map(({ name, matchRate }) => ({ name, matchRate }));

      // Overall uniqueness score
      const avgUniqueness =
        featureUniqueness.reduce((sum, f) => sum + f.uniqueness, 0) /
        featureUniqueness.length;

      setMetrics({
        totalStored: previousFingerprints.length,
        exactMatches,
        partialMatches,
        uniquenessScore: avgUniqueness,
        featureScores: featureUniqueness,
        mostUniqueFeatures,
        commonFeatures,
      });
    };

    analyzeUniqueness();
  }, [result]);

  useEffect(() => {
    let cancelled = false;

    async function loadBaseline() {
      try {
        const json = await fetchBaseline(result);
        if (!cancelled) {
          setBaseline(json);
        }
      } catch (_error) {
        void _error;
      }
    }

    void loadBaseline();

    return () => {
      cancelled = true;
    };
  }, [result]);

  if (!metrics) {
    return null;
  }

  const blendedFeatureScores = React.useMemo(() => {
    const localScores = new Map(
      metrics.featureScores.map((feature) => [feature.name, feature])
    );

    const baselineScores = Object.values(baseline?.estimates ?? {})
      .filter(
        (
          estimate
        ): estimate is BaselineEstimate & {
          rarity: number;
          sampleSize: number;
        } =>
          Boolean(
            estimate &&
              !estimate.suppressed &&
              typeof estimate.rarity === 'number' &&
              typeof estimate.sampleSize === 'number'
          )
      )
      .map((estimate) => ({
        name: labelForBaselineComponent(estimate.component),
        uniqueness: 1 - estimate.rarity,
        matchRate: estimate.rarity,
      }));

    if (baselineScores.length === 0) {
      return metrics.featureScores;
    }

    const merged = new Map(
      metrics.featureScores.map((feature) => [feature.name, feature])
    );

    for (const baselineFeature of baselineScores) {
      const local = localScores.get(baselineFeature.name);
      if (!local) {
        merged.set(baselineFeature.name, baselineFeature);
        continue;
      }

      merged.set(baselineFeature.name, {
        name: baselineFeature.name,
        uniqueness: baselineFeature.uniqueness * 0.7 + local.uniqueness * 0.3,
        matchRate: baselineFeature.matchRate * 0.7 + local.matchRate * 0.3,
      });
    }

    return Array.from(merged.values());
  }, [baseline, metrics.featureScores]);

  const blendedUniquenessScore =
    blendedFeatureScores.reduce((sum, feature) => sum + feature.uniqueness, 0) /
    blendedFeatureScores.length;

  const displayedMostUniqueFeatures = [...blendedFeatureScores]
    .sort((a, b) => b.uniqueness - a.uniqueness)
    .slice(0, 5)
    .map(({ name, uniqueness }) => ({ name, uniqueness }));

  const displayedCommonFeatures = [...blendedFeatureScores]
    .sort((a, b) => b.matchRate - a.matchRate)
    .slice(0, 5)
    .map(({ name, matchRate }) => ({ name, matchRate }));

  const uniquenessPercent = Math.round(blendedUniquenessScore * 100);
  const uniquenessLevel =
    uniquenessPercent >= 80
      ? 'high'
      : uniquenessPercent >= 50
        ? 'medium'
        : 'low';

  return (
    <div className="space-y-6">
      {/* Overall Uniqueness Card */}
      <Card
        className={`border-2 ${
          uniquenessLevel === 'high'
            ? 'border-green-500/50 bg-green-500/5'
            : uniquenessLevel === 'medium'
              ? 'border-yellow-500/50 bg-yellow-500/5'
              : 'border-red-500/50 bg-red-500/5'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fingerprint Uniqueness Analysis
          </CardTitle>
          <CardDescription>
            {isFirstVisit
              ? 'This is your first fingerprint capture. Visit again to see uniqueness analysis.'
              : `Compared with ${metrics.totalStored} stored fingerprint${metrics.totalStored !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Uniqueness Score */}
            <div className="space-y-2 text-center">
              <div
                className={`text-6xl font-bold ${
                  uniquenessLevel === 'high'
                    ? 'text-green-600 dark:text-green-400'
                    : uniquenessLevel === 'medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {uniquenessPercent}%
              </div>
              <div className="text-muted-foreground text-lg">
                Uniqueness Score
              </div>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                {uniquenessPercent >= 80
                  ? 'Your browser fingerprint is highly unique. This makes you easily trackable but harder to profile.'
                  : uniquenessPercent >= 50
                    ? 'Your browser fingerprint is moderately unique. Some tracking protection is in place.'
                    : 'Your browser fingerprint is common. This provides privacy through anonymity but basic tracking is possible.'}
              </p>
              {baseline && (
                <p className="text-muted-foreground mx-auto max-w-md text-xs">
                  This score blends local repeat history with the anonymous API
                  population baseline when enough samples exist.
                </p>
              )}
            </div>

            {/* Match Statistics */}
            {!isFirstVisit && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background space-y-1 rounded-lg border p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Total Stored</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.totalStored}
                  </div>
                </div>
                <div className="bg-background space-y-1 rounded-lg border p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Exact Matches</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {metrics.exactMatches}
                  </div>
                </div>
                <div className="bg-background space-y-1 rounded-lg border p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Partial Matches</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {metrics.partialMatches}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!isFirstVisit && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Most Unique Features */}
          <Card>
            <CardHeader>
              <CardTitle>Most Unique Features</CardTitle>
              <CardDescription>
                Features that make your fingerprint stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedMostUniqueFeatures.map((feature, index) => {
                  const uniquenessPercent = Math.round(
                    feature.uniqueness * 100
                  );
                  return (
                    <div key={feature.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-green-500 text-white'
                                : index === 1
                                  ? 'bg-green-400 text-white'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {uniquenessPercent}% unique
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${uniquenessPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Most Common Features */}
          <Card>
            <CardHeader>
              <CardTitle>Most Common Features</CardTitle>
              <CardDescription>
                Features shared with other fingerprints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedCommonFeatures.map((feature, index) => {
                  const matchPercent = Math.round(feature.matchRate * 100);
                  return (
                    <div key={feature.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-red-500 text-white'
                                : index === 1
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {matchPercent}% match
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all duration-500"
                          style={{ width: `${matchPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {baseline && (
        <Card>
          <CardHeader>
            <CardTitle>Population Baseline</CardTitle>
            <CardDescription>
              Anonymous aggregate rarity from the API. Buckets below the
              k-anonymity threshold stay suppressed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-background space-y-1 rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">
                  Total Samples
                </div>
                <div className="text-2xl font-bold">
                  {baseline.totalSamples}
                </div>
              </div>
              <div className="bg-background space-y-1 rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">
                  k-Anonymity Threshold
                </div>
                <div className="text-2xl font-bold">
                  {baseline.kAnonThreshold}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {Object.values(baseline.estimates).map((estimate) => {
                if (!estimate) return null;

                return (
                  <div
                    key={estimate.component}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">
                        {labelForBaselineComponent(estimate.component)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {estimate.suppressed
                          ? 'Suppressed'
                          : `${Math.round((1 - (estimate.rarity ?? 0)) * 100)}% rare`}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {estimate.suppressed
                        ? `Hidden until at least ${baseline.kAnonThreshold} samples share this bucket.`
                        : `${estimate.sampleSize} matching samples in ${baseline.totalSamples} total observations.`}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Shield className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-muted-foreground space-y-1 text-sm">
                <p className="text-foreground font-medium">
                  About Uniqueness Analysis
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>High uniqueness (80%+)</strong>: Your fingerprint is
                    rare and easily trackable across sites
                  </li>
                  <li>
                    <strong>Medium uniqueness (50-80%)</strong>: Some unique
                    features, moderate tracking resistance
                  </li>
                  <li>
                    <strong>Low uniqueness (&lt;50%)</strong>: Common
                    fingerprint, harder to track individually
                  </li>
                  <li>
                    Local history remains browser-only, while the API baseline
                    uses anonymous coarse buckets with k-anonymity suppression
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
