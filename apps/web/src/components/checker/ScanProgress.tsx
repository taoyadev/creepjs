'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type {
  CollectionProgress,
  FingerprintScanStatus,
} from '@/components/checker/types';

interface ScanProgressProps {
  status: Exclude<FingerprintScanStatus, 'ready'>;
  progress: CollectionProgress;
  error: string | null;
  onRetry: () => void;
}

export function ScanProgress({
  status,
  progress,
  error,
  onRetry,
}: ScanProgressProps) {
  if (status === 'error') {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <div role="alert" className="text-destructive font-medium">
            {error ?? 'Fingerprint collection failed.'}
          </div>
          <Button onClick={onRetry}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 py-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Collecting browser fingerprint
          </h2>
          <p className="text-muted-foreground text-sm">
            The scan runs locally and keeps the rest of this page available.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {progress.current} / {progress.total}
            </span>
          </div>
          <Progress
            label="Browser fingerprint collection progress"
            value={progress.current}
            max={progress.total}
            className="h-3"
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-muted-foreground text-sm"
        >
          {progress.currentCollector || 'Initializing scan'}
        </p>
      </CardContent>
    </Card>
  );
}
