'use client';

import React from 'react';
import { Info, ScanLine } from 'lucide-react';
import type { SharedCheckerSnapshot } from '@/components/checker/hooks/useCheckerUrlState';

interface SharedResultBannerProps {
  snapshot: SharedCheckerSnapshot | null;
  currentFingerprintId?: string;
}

export function SharedResultBanner({
  snapshot,
  currentFingerprintId,
}: SharedResultBannerProps) {
  if (!snapshot) return null;

  const comparison =
    currentFingerprintId === undefined
      ? 'Your own scan is still running below.'
      : currentFingerprintId === snapshot.fingerprintId
        ? 'Your current diagnostic ID matches this snapshot.'
        : 'Your current diagnostic ID differs from this snapshot.';

  return (
    <aside
      className="border-primary/25 bg-primary/5 rounded-xl border p-4"
      aria-label="Shared fingerprint snapshot context"
    >
      <div className="flex items-start gap-3">
        <Info
          className="text-primary mt-0.5 h-5 w-5 shrink-0"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-semibold">Shared snapshot context</p>
            <code className="bg-background max-w-full truncate rounded border px-2 py-0.5 font-mono text-xs">
              {snapshot.fingerprintId}
            </code>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            This link records a past diagnostic summary; it does not reproduce
            another browser or replace the live collection on this device.{' '}
            {comparison}
          </p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            {snapshot.coverage !== null && (
              <div className="flex gap-1">
                <dt className="text-muted-foreground">Shared coverage:</dt>
                <dd className="font-semibold">
                  {snapshot.coverage.toFixed(1)}%
                </dd>
              </div>
            )}
            {snapshot.baselineCount !== null && (
              <div className="flex gap-1">
                <dt className="text-muted-foreground">Baseline samples:</dt>
                <dd className="font-semibold">{snapshot.baselineCount}</dd>
              </div>
            )}
          </dl>
        </div>
        <ScanLine
          className="text-primary/60 ml-auto hidden h-5 w-5 shrink-0 sm:block"
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
