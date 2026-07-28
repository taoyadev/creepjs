'use client';

import React from 'react';
import { LockKeyhole, Shield, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  getBaselineProgress,
  labelForBaselineComponent,
  summarizeBaseline,
  type BaselineEstimate,
  type BaselineResponse,
} from '@/lib/uniqueness-baseline';

interface UniquenessAnalysisProps {
  baseline: BaselineResponse | null;
}

export function UniquenessAnalysis({
  baseline,
}: UniquenessAnalysisProps) {
  const progress = getBaselineProgress(baseline);

  if (progress.warming) {
    return (
      <Card
        className="border-primary/20 bg-primary/5"
        aria-live="polite"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Baseline warming up ({progress.sampleCount}/{progress.threshold})
          </CardTitle>
          <CardDescription>
            Population rarity is intentionally hidden until the anonymous
            baseline reaches its k-anonymity threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress
            label="Anonymous uniqueness baseline sample progress"
            value={progress.sampleCount}
            max={progress.threshold}
          />
          <p className="text-muted-foreground text-sm leading-6">
            Your live collector values and coverage remain available above.
            CreepJS will not turn a first visit or a tiny local history into a
            fabricated uniqueness percentage.
          </p>
        </CardContent>
      </Card>
    );
  }

  const estimates = Object.values(baseline?.estimates ?? {}).filter(
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
  );
  const summary = summarizeBaseline(baseline);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
            Anonymous Population Baseline
          </CardTitle>
          <CardDescription>
            Baseline-backed rarity context across coarse, k-anonymous signal
            buckets—not an identity score or a probability of fraud.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-muted-foreground text-sm">Total samples</div>
            <div className="mt-1 text-2xl font-bold">
              {progress.sampleCount}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-muted-foreground text-sm">
              Revealed signal buckets
            </div>
            <div className="mt-1 text-2xl font-bold">{estimates.length}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-muted-foreground text-sm">
              Average rarity context
            </div>
            <div className="mt-1 text-2xl font-bold">
              {summary?.rarityPercent === null ||
              summary?.rarityPercent === undefined
                ? 'Suppressed'
                : `${summary.rarityPercent}%`}
            </div>
          </div>
        </CardContent>
      </Card>

      {estimates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {estimates.map((estimate) => {
            const rarityPercent = Math.round((1 - estimate.rarity) * 100);
            return (
              <Card key={estimate.component}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base">
                      {labelForBaselineComponent(estimate.component)}
                    </CardTitle>
                    <span className="text-primary text-sm font-bold">
                      {rarityPercent}% rare
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {estimate.sampleSize} matching samples among{' '}
                    {progress.sampleCount} anonymous observations.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="flex items-start gap-3 pt-6">
            <LockKeyhole
              className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm leading-6">
              The overall baseline is ready, but every matching signal bucket
              remains below its disclosure threshold. No rarity percentages
              are shown.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
