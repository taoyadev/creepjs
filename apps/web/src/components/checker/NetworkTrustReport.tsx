'use client';

import React from 'react';
import Link from 'next/link';
import type { FingerprintResult } from '@creepjs/core';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Network,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OwnIpState } from '@/components/checker/hooks/useOwnIp';
import {
  buildNetworkTrustModel,
  type TrustTone,
} from '@/components/checker/network-trust-model';
import { cn } from '@/lib/utils';

interface NetworkTrustReportProps {
  result: FingerprintResult;
  ownIp: OwnIpState;
  onRetryIp: () => void;
}

const TONE_STYLES: Record<TrustTone, string> = {
  clear: 'border-success/30 bg-success/5 text-foreground',
  neutral: 'border-border bg-muted/40 text-foreground',
  review: 'border-warning/40 bg-warning/10 text-foreground',
};

export function NetworkTrustReport({
  result,
  ownIp,
  onRetryIp,
}: NetworkTrustReportProps) {
  const model = buildNetworkTrustModel(result, ownIp);
  const VerdictIcon = model.tone === 'review' ? AlertTriangle : CheckCircle2;

  return (
    <section id="trust" className="section-anchor space-y-5">
      <Card className="overflow-hidden border-2">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-2">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                Browser × network
              </p>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Network className="h-6 w-6" aria-hidden="true" />
                Network Trust Report
              </CardTitle>
            </div>
            <div
              className={cn(
                'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold',
                TONE_STYLES[model.tone]
              )}
            >
              <VerdictIcon className="h-4 w-4" aria-hidden="true" />
              {model.headline}
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6">
            {model.summary}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            {model.dimensions.map((dimension) => (
              <article
                key={dimension.label}
                className={cn(
                  'rounded-lg border p-4',
                  TONE_STYLES[dimension.tone]
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {dimension.label}
                </p>
                <p className="mt-2 font-semibold">{dimension.value}</p>
                <p className="mt-1 text-sm leading-6 opacity-80">
                  {dimension.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 border-t pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-2 flex items-center gap-2 font-semibold">
                <Info className="h-4 w-4" aria-hidden="true" />
                How to use this report
              </p>
              <ul className="text-muted-foreground space-y-1 text-sm leading-6">
                {model.guidance.map((guidance) => (
                  <li key={guidance}>• {guidance}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {ownIp.status === 'error' && (
                <Button type="button" variant="outline" onClick={onRetryIp}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Retry network context
                </Button>
              )}
              {model.ip && (
                <Button asChild>
                  <Link href={`/ip?q=${encodeURIComponent(model.ip.ip)}`}>
                    Investigate this IP
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <p className="text-muted-foreground border-t pt-4 text-xs leading-5">
            This is a transparent diagnostic summary. It does not identify a
            person, prove that a session is safe, or estimate a probability of
            fraud.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
