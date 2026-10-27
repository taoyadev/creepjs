'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Globe2,
  Link2,
  Loader2,
  Network,
  ShieldAlert,
  ShieldCheck,
  Signal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { IpBatchWorkspace } from '@/components/ip/IpBatchWorkspace';
import { ApiError, fetchJson } from '@/lib/api-client';
import {
  IpInputError,
  lookupPublicIp,
  publicIpLookupErrorMessage,
  type PublicIpLookupResult,
} from '@/lib/public-ip-lookup';

function display(value: unknown, fallback = 'Unknown') {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return fallback;
}

function resetTime(reset: number | null | undefined) {
  return reset ? new Date(reset * 1000).toLocaleString() : 'Unknown';
}

function Metric({ name, value }: { name: string; value: unknown }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{name}</span>
      <span className="max-w-[60%] break-words text-right font-medium">
        {display(value)}
      </span>
    </div>
  );
}

export default function IpRiskPage() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<PublicIpLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectingIp, setDetectingIp] = useState(true);

  // Core lookup, keyed on an explicit target so it can be driven from the form,
  // a shareable `?q=` link on load, or a retry — without a stale-closure read of
  // `ip`. On success it writes `?q=<ip>` to the address bar so the result is
  // linkable. `useCallback([])` keeps it stable for the mount effect's deps.
  const performLookup = useCallback(async (rawTarget: string) => {
    const target = rawTarget.trim();
    setError(null);

    if (!target) {
      setError('Enter a valid IPv4 or IPv6 address.');
      return;
    }

    setIp(target);
    setLoading(true);
    try {
      const data = await lookupPublicIp(target);
      setResult(data);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('q', target);
        window.history.replaceState(
          null,
          '',
          `${url.pathname}${url.search}${url.hash}`
        );
      }
      toast.success('IP risk lookup complete');
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'ip',
        outcome: 'success',
        status: '200',
      });
    } catch (lookupError) {
      setResult(null);
      setError(publicIpLookupErrorMessage(lookupError));
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'ip',
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentIp() {
      setDetectingIp(true);
      try {
        const data = await fetchJson<{ ip?: string }>('/my-ip');
        if (!cancelled && data.ip) setIp(data.ip);
      } catch {
        if (!cancelled) setError('Enter an IP address to run a risk lookup.');
      } finally {
        if (!cancelled) setDetectingIp(false);
      }
    }

    // A shareable `?q=<ip>` link runs that lookup on load; otherwise detect
    // the visitor's own IP.
    const shared =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('q')?.trim()
        : null;

    if (shared) {
      setDetectingIp(false);
      void performLookup(shared);
    } else {
      void loadCurrentIp();
    }

    return () => {
      cancelled = true;
    };
  }, [performLookup]);

  const tone = useMemo(() => {
    if (!result) {
      return {
        Icon: Signal,
        badge: 'Awaiting lookup',
        title: 'Ready to check',
        className:
          'border-slate-500/30 bg-slate-500/10 text-slate-800 dark:text-slate-200',
      };
    }

    if (result.highRisk) {
      return {
        Icon: ShieldAlert,
        badge: 'High risk',
        title: 'High-risk network signal',
        className:
          'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200',
      };
    }

    return {
      Icon: ShieldCheck,
      badge: 'Low risk',
      title: 'No elevated network risk',
      className:
        'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
    };
  }, [result]);

  const runLookup = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    void performLookup(ip);
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success('Result copied');
    trackEvent('button_clicked', {
      label: 'copy_ip_result',
      section: 'ip-checker',
    });
  };

  const copyShareLink = async () => {
    if (!result || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/ip?q=${encodeURIComponent(result.data.ip)}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied');
    trackEvent('button_clicked', {
      label: 'copy_ip_share_link',
      section: 'ip-checker',
    });
  };

  const ToneIcon = tone.Icon;
  const location = result?.data.location;
  const network = result?.data.network;
  const routing = result?.data.routing;
  const score = result?.data.score;
  const classification = result?.data.classification;
  const signals = result?.data.evidence?.signals ?? [];

  return (
    <div className="bg-background min-h-screen">
      <section className="bg-muted/30 border-b">
        <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-14">
          <div className="max-w-3xl space-y-5">
            <Badge variant="outline" className="w-fit">
              <Globe2 className="h-4 w-4 text-emerald-500" />
              Free IP intelligence — no signup
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold md:text-5xl">
                IP Risk Checker
              </h1>
              <p className="text-muted-foreground text-base leading-7 md:text-lg">
                Look up geolocation, ASN, routing, proxy, VPN, Tor, datacenter,
                and risk signals for any IP address — free, no token required.
                Just enter an IP and check.
              </p>
            </div>
          </div>

          <Card className="self-start">
            <CardHeader>
              <CardTitle className="text-xl">Run a lookup</CardTitle>
              <CardDescription>
                Free — no token needed. Limited to {30} lookups/day per visitor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => void runLookup(event)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="ip-address" className="text-sm font-medium">
                    IP address
                  </label>
                  <Input
                    id="ip-address"
                    value={ip}
                    onChange={(event) => setIp(event.target.value)}
                    className="font-mono"
                    placeholder={
                      detectingIp ? 'Detecting your IP...' : '8.8.8.8'
                    }
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {loading ? 'Checking...' : 'Check IP Risk'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto space-y-6 px-4 py-8">
        <Card className={cn('border-2', tone.className)}>
          <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <div className="bg-background/80 flex h-14 w-14 items-center justify-center rounded-md">
              <ToneIcon className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm font-medium uppercase">
                {tone.badge}
              </div>
              <h2 className="text-2xl font-semibold">{tone.title}</h2>
              <p className="text-muted-foreground text-sm">
                {result
                  ? `${result.data.ip} scored ${display(score?.risk_score)} risk with verdict ${display(score?.verdict).toLowerCase()}.`
                  : 'Enter an IP address to retrieve risk, routing, and network ownership signals.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void copyShareLink()}
                disabled={!result}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Copy link
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void copyResult()}
                disabled={!result}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe2 className="h-5 w-5 text-emerald-500" />
                Geo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Metric
                name="Country"
                value={location?.country ?? location?.country_code}
              />
              <Metric name="City" value={location?.city} />
              <Metric name="Region" value={location?.region} />
              <Metric name="Timezone" value={location?.timezone} />
              <Metric
                name="Coordinates"
                value={
                  location?.latitude && location.longitude
                    ? `${location.latitude}, ${location.longitude}`
                    : undefined
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="h-5 w-5 text-blue-500" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Metric name="ASN" value={network?.asn ?? routing?.origin_asn} />
              <Metric
                name="Organization"
                value={network?.org ?? network?.owner}
              />
              <Metric name="Category" value={network?.category} />
              <Metric name="Service role" value={network?.service_role} />
              <Metric name="Prefix" value={routing?.prefix} />
              <Metric name="RPKI" value={routing?.rpki_status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Metric name="Risk score" value={score?.risk_score} />
              <Metric name="IP score" value={score?.ip_score} />
              <Metric name="Band" value={score?.band} />
              <Metric name="Verdict" value={score?.verdict} />
              <Metric
                name="Threat level"
                value={classification?.threat_level}
              />
              <Metric name="Proxy" value={classification?.is_proxy} />
              <Metric name="VPN" value={classification?.is_vpn} />
              <Metric name="Tor" value={classification?.is_tor} />
              <Metric name="Datacenter" value={classification?.is_datacenter} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evidence Signals</CardTitle>
              <CardDescription>
                Empty evidence usually means the IP has no notable negative
                indicators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.map((signal, index) => (
                    <div
                      key={`${signal.category ?? 'signal'}-${index}`}
                      className="bg-muted/30 rounded-md border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {display(signal.label, 'Signal')}
                        </span>
                        <span className="bg-background text-muted-foreground rounded-md px-2 py-1 text-xs">
                          {display(signal.severity)}
                        </span>
                        <span className="bg-background text-muted-foreground rounded-md px-2 py-1 text-xs">
                          {display(signal.confidence)}
                        </span>
                      </div>
                      {signal.description && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {signal.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 text-muted-foreground rounded-md border p-6 text-sm">
                  <CheckCircle className="mb-3 h-6 w-6 text-emerald-500" />
                  No evidence signals returned yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lookup Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Metric name="Cache hit" value={result?.cached} />
              <Metric name="Tier" value={result?.rateLimit.tier} />
              <Metric name="Daily limit" value={result?.rateLimit.limit} />
              <Metric
                name="Remaining today"
                value={result?.rateLimit.remaining}
              />
              <Metric
                name="Resets"
                value={resetTime(result?.rateLimit.reset)}
              />
              <div className="text-muted-foreground rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-xs">
                Free public lookups are rate-limited per visitor. Developers
                needing higher limits can call{' '}
                <code className="font-mono">GET /v1/ip/:ip</code> with a CreepJS
                API token. The paid upstream key stays on the Worker.
              </div>
            </CardContent>
          </Card>
        </div>

        <IpBatchWorkspace />
      </section>
    </div>
  );
}
