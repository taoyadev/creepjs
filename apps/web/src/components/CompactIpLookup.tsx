'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Server,
  ShieldAlert,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { ApiError } from '@/lib/api-client';
import {
  IpInputError,
  lookupPublicIp,
  publicIpLookupErrorMessage,
  type PublicIpLookupResult,
} from '@/lib/public-ip-lookup';

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return 'Unknown';
  return value ? 'Detected' : 'Not flagged';
}

function resultHeading(result: PublicIpLookupResult): string {
  const classification = result.data.classification;
  if (
    classification?.is_proxy ||
    classification?.is_vpn ||
    classification?.is_tor
  ) {
    return 'Proxy-related signals found';
  }
  if (classification?.is_datacenter) {
    return 'No proxy flag; datacenter signals found';
  }
  return 'No proxy flag returned';
}

export function CompactIpLookup() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<PublicIpLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputInvalid, setInputInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInputInvalid(false);
    setResult(null);
    setLoading(true);

    try {
      const nextResult = await lookupPublicIp(ip);
      setResult(nextResult);
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'proxy-intent-pilot',
        outcome: 'success',
        status: '200',
      });
    } catch (lookupError) {
      setError(publicIpLookupErrorMessage(lookupError));
      setInputInvalid(
        lookupError instanceof IpInputError ||
          (lookupError instanceof ApiError && lookupError.status === 400)
      );
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'proxy-intent-pilot',
        outcome: 'error',
        status: String(
          lookupError instanceof IpInputError
            ? 400
            : lookupError instanceof ApiError
              ? lookupError.status
              : 0
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const classification = result?.data.classification;
  const score = result?.data.score;
  const network = result?.data.network;
  const signals = result?.data.evidence?.signals ?? [];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <Badge variant="outline" className="mb-2 w-fit">
          Free · no signup
        </Badge>
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          Check an IP now
        </h2>
        <CardDescription>
          Submit one IPv4 or IPv6 address. The address is used for this lookup
          and is never sent to analytics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-3"
          aria-busy={loading}
        >
          <div className="space-y-2">
            <label htmlFor="compact-ip-address" className="text-sm font-medium">
              IP address
            </label>
            <Input
              id="compact-ip-address"
              value={ip}
              onChange={(event) => {
                setIp(event.target.value);
                setInputInvalid(false);
              }}
              placeholder="8.8.8.8 or 2001:4860:4860::8888"
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
              maxLength={45}
              aria-invalid={inputInvalid || undefined}
              aria-describedby={
                inputInvalid
                  ? 'compact-ip-help compact-ip-error'
                  : 'compact-ip-help'
              }
            />
            <p id="compact-ip-help" className="text-muted-foreground text-xs">
              Hostnames, URLs, and IP ranges are not accepted.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {loading ? 'Checking signals…' : 'Check for proxy signals'}
          </Button>
        </form>

        <div aria-live="polite" aria-atomic="true">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription id="compact-ip-error">{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Qualified result
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {resultHeading(result)}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  This is a signal-based classification, not proof of who is
                  using the address or why.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Proxy', yesNo(classification?.is_proxy)],
                  ['VPN', yesNo(classification?.is_vpn)],
                  ['Tor', yesNo(classification?.is_tor)],
                  ['Datacenter', yesNo(classification?.is_datacenter)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-background rounded-md p-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <ShieldAlert
                    className="text-warning mt-0.5 h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>
                    Risk: {score?.risk_score ?? 'Unknown'}
                    {score?.band ? ` · ${score.band}` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Server
                    className="text-primary mt-0.5 h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>
                    Network:{' '}
                    {network?.org ??
                      network?.owner ??
                      network?.asn ??
                      'Unknown'}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Usage type: {classification?.usage_type ?? 'Unknown'}
                </div>
              </div>

              {signals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Returned evidence</h3>
                  <ul className="space-y-2 text-sm">
                    {signals.slice(0, 3).map((signal, index) => (
                      <li
                        key={`${signal.category ?? 'signal'}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 text-emerald-500"
                          aria-hidden="true"
                        />
                        <span>
                          {signal.label ?? 'Evidence signal'}
                          {signal.confidence
                            ? ` · ${signal.confidence} confidence`
                            : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {signals.length > 3 && (
                    <p className="text-muted-foreground text-xs">
                      Showing 3 of {signals.length} evidence signals. Open the
                      full report to inspect all returned evidence.
                    </p>
                  )}
                </div>
              )}

              <Button asChild className="w-full">
                <Link
                  href={`/ip?q=${encodeURIComponent(result.data.ip)}`}
                  onClick={() =>
                    trackEvent('button_clicked', {
                      label: 'open_full_ip_report',
                      section: 'proxy-intent-pilot',
                    })
                  }
                >
                  Open the full IP report
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
