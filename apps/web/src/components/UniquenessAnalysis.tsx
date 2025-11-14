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

interface UniquenessAnalysisProps {
  result: FingerprintResult;
}

interface StoredFingerprint {
  id: string;
  timestamp: number;
  data: Record<string, string>;
}

interface UniquenessMetrics {
  totalStored: number;
  exactMatches: number;
  partialMatches: number;
  uniquenessScore: number;
  mostUniqueFeatures: Array<{ name: string; uniqueness: number }>;
  commonFeatures: Array<{ name: string; matchRate: number }>;
}

export function UniquenessAnalysis({ result }: UniquenessAnalysisProps) {
  const [metrics, setMetrics] = useState<UniquenessMetrics | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const analyzeUniqueness = () => {
      // Get stored fingerprints from localStorage
      const storedData = localStorage.getItem('creepjs_fingerprints');
      const stored: StoredFingerprint[] = storedData
        ? JSON.parse(storedData)
        : [];

      // Current fingerprint features
      const currentFeatures: Record<string, string> = {
        canvas: result.data.canvas?.hash || 'none',
        webgl: result.data.webgl?.renderer || 'none',
        navigator: result.data.navigator?.userAgent || 'none',
        screen:
          `${result.data.screen?.width}x${result.data.screen?.height}` ||
          'none',
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
        mostUniqueFeatures,
        commonFeatures,
      });
    };

    analyzeUniqueness();
  }, [result]);

  if (!metrics) {
    return null;
  }

  const uniquenessPercent = Math.round(metrics.uniquenessScore * 100);
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
                {metrics.mostUniqueFeatures.map((feature, index) => {
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
                {metrics.commonFeatures.map((feature, index) => {
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
                    Data is stored locally in your browser and never sent to any
                    server
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
