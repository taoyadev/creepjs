'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Globe2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';
import { fetchJson } from '@/lib/api-client';
import type { OwnIpSummary } from '@/lib/own-ip';

type IpState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: OwnIpSummary }
  | { status: 'error'; data: null };

export function LiveIpCard() {
  const [state, setState] = useState<IpState>({
    status: 'loading',
    data: null,
  });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: 'loading', data: null });
    try {
      const data = await fetchJson<OwnIpSummary>('/my-ip', {
        signal,
        timeoutMs: 8000,
      });
      setState({ status: 'ready', data });
    } catch (error) {
      if (signal?.aborted) return;
      console.warn('Homepage own-IP card unavailable:', error);
      setState({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const data = state.data;
  const location = data?.location
    ? [data.location.city, data.location.region, data.location.country_code]
        .filter(Boolean)
        .join(', ')
    : '';
  const RiskIcon = data?.risk?.highRisk ? ShieldAlert : ShieldCheck;

  return (
    <Card className="flex min-h-[22rem] flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-primary mb-1 text-xs font-semibold uppercase tracking-wider">
              Network evidence
            </p>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
              Your public IP
            </CardTitle>
          </div>
          {state.status !== 'loading' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void load()}
              aria-label="Refresh own-IP summary"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-6">
        {state.status === 'loading' && (
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-label="Loading public IP summary"
          >
            <div className="bg-muted h-10 animate-pulse rounded-md" />
            <div className="bg-muted h-16 animate-pulse rounded-md" />
            <div className="bg-muted h-12 animate-pulse rounded-md" />
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-4" role="alert">
            <p className="font-semibold">Network summary unavailable.</p>
            <p className="text-muted-foreground text-sm leading-6">
              The public API did not respond in time. No stale IP result is
              shown.
            </p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        )}

        {state.status === 'ready' && data && (
          <div className="animate-fade-in-up space-y-5">
            <div>
              <p className="text-muted-foreground text-xs">Address</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm font-bold">
                  {data.ip}
                </code>
                <CopyButton
                  value={data.ip}
                  ariaLabel="Copy public IP address"
                  successMessage="IP address copied"
                />
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b pb-3">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="text-right font-medium">
                  {location || 'Not available'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-3">
                <dt className="text-muted-foreground">Network</dt>
                <dd className="text-right font-medium">
                  {data.asn?.organization ??
                    (data.asn?.number ? `AS${data.asn.number}` : 'Not available')}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Risk context</dt>
                <dd className="flex items-center gap-1.5 text-right font-medium">
                  <RiskIcon className="h-4 w-4" aria-hidden="true" />
                  {data.risk?.band ?? data.risk?.verdict ?? 'Geo only'}
                </dd>
              </div>
            </dl>
            <p className="text-muted-foreground text-xs leading-5">
              {data.error
                ? data.error
                : 'IP risk enrichment is optional. “Geo only” means the free Cloudflare location context succeeded without a risk verdict.'}
            </p>
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/ip">
            Open IP risk checker
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
