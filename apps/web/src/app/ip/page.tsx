'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Globe2, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/CopyButton';
import { trackEvent } from '@/lib/analytics';
import { IpPartnerRecommendations } from '@/components/partners/PartnerCards';
import { PartnerTrackingProvider } from '@/components/partners/PartnerTracking';
import { IpBatchWorkspace } from '@/components/ip/IpBatchWorkspace';
import { ApiError, fetchJson } from '@/lib/api-client';
import { assessIpResult } from '@/lib/ip-result';
import {
  IpInputError,
  isValidIpLiteral,
  lookupPublicIp,
  publicIpLookupErrorMessage,
  type PublicIpLookupResult,
} from '@/lib/public-ip-lookup';

function display(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Detected' : 'Not flagged';
  return 'Not returned';
}

function Metric({ name, value }: { name: string; value: unknown }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-b py-2.5 last:border-0">
      <dt className="text-muted-foreground">{name}</dt>
      <dd className="break-words text-right font-medium [overflow-wrap:anywhere]">
        {display(value)}
      </dd>
    </div>
  );
}

export default function IpRiskPage() {
  const [interactive, setInteractive] = useState(false);
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<PublicIpLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(true);
  const [detectionFailed, setDetectionFailed] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [checkedAt, setCheckedAt] = useState('');
  const request = useRef<AbortController | null>(null);
  const detection = useRef<AbortController | null>(null);
  const edited = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  const detectIp = useCallback(async () => {
    detection.current?.abort();
    const controller = new AbortController();
    detection.current = controller;
    setDetecting(true);
    setDetectionFailed(false);
    try {
      const response = await fetchJson<{ ip?: string }>('/my-ip', {
        signal: controller.signal,
        timeoutMs: 8000,
      });
      if (controller.signal.aborted) return;
      if (!response.ip || !isValidIpLiteral(response.ip))
        throw new Error('No address');
      if (!edited.current) setIp(response.ip);
    } catch {
      if (!controller.signal.aborted) setDetectionFailed(true);
    } finally {
      if (!controller.signal.aborted) setDetecting(false);
    }
  }, []);

  const performLookup = useCallback(async (raw: string) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    detection.current?.abort();
    setDetecting(false);
    edited.current = true;
    setError(null);
    setInvalid(false);
    setResult(null);
    setLoading(false);
    const target = raw.trim();
    setIp(target);
    if (!isValidIpLiteral(target)) {
      setInvalid(true);
      setError(
        target
          ? 'Enter one IPv4 or IPv6 address. URLs, hostnames, ports, and ranges are not accepted.'
          : 'Enter an IP address, choose an example, or use your own IP.'
      );
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const next = await lookupPublicIp(target, controller.signal);
      if (controller.signal.aborted) return;
      setResult(next);
      setCheckedAt(new Date().toLocaleTimeString());
      const url = new URL(window.location.href);
      url.searchParams.set('q', target);
      window.history.replaceState(
        null,
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
      const share = new URL(url);
      share.hash = '';
      setShareUrl(share.href);
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'ip',
        outcome: 'success',
        status: '200',
      });
    } catch (cause) {
      if (controller.signal.aborted) return;
      setInvalid(
        cause instanceof IpInputError ||
          (cause instanceof ApiError && cause.status === 400)
      );
      setError(publicIpLookupErrorMessage(cause));
      trackEvent('tool_run', {
        tool: 'ip_lookup',
        surface: 'ip',
        outcome: 'error',
        status: String(cause instanceof ApiError ? cause.status : 0),
      });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get('q')?.trim();
    setInteractive(true);
    if (shared) void performLookup(shared);
    else void detectIp();
    return () => {
      request.current?.abort();
      detection.current?.abort();
    };
  }, [detectIp, performLookup]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) void performLookup(ip);
  };
  const preset = (value: string) => {
    edited.current = true;
    setIp(value);
    setInvalid(false);
    setError(null);
    inputRef.current?.focus();
  };
  const assessment = result ? assessIpResult(result) : null;
  const { location, network, routing, score, classification } =
    result?.data ?? {};
  const signals = result?.data.evidence?.signals ?? [];

  return (
    <PartnerTrackingProvider>
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-7 md:px-8 md:py-10">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            IP Risk Checker
          </h1>
          <p className="text-muted-foreground leading-7">
            Check one address for proxy, VPN, Tor, location, and network
            evidence. Free, no token required; up to 30 public lookups per day
            per visitor.
          </p>
        </header>
        <section aria-label="Single IP lookup" className="space-y-4">
          <form
            onSubmit={submit}
            className="bg-card space-y-3 rounded-xl border p-4 sm:p-5"
          >
            <label htmlFor="ip-address" className="block text-sm font-semibold">
              IP address
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                ref={inputRef}
                id="ip-address"
                disabled={!interactive}
                value={ip}
                onChange={(event) => {
                  edited.current = true;
                  setIp(event.target.value);
                  setInvalid(false);
                  setError(null);
                }}
                placeholder={
                  !interactive
                    ? 'Preparing lookup controls…'
                    : detecting
                      ? 'Detecting your IP… or enter an address'
                      : '8.8.8.8 or 2606:4700:4700::1111'
                }
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={45}
                className="min-w-0 flex-1 font-mono"
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? 'ip-help ip-error' : 'ip-help'}
              />
              <Button
                type="submit"
                disabled={!interactive || loading}
                className="min-h-11 sm:w-40"
              >
                {loading && (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {!interactive
                  ? 'Preparing…'
                  : loading
                    ? 'Checking…'
                    : 'Check IP Risk'}
              </Button>
              {loading && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    request.current?.abort();
                    setLoading(false);
                    setError(
                      'Lookup cancelled. Your input is kept; submit again when ready.'
                    );
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!interactive || detecting || loading}
                onClick={() => {
                  edited.current = false;
                  void detectIp();
                }}
              >
                {detecting ? 'Detecting your IP…' : 'Use my IP'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!interactive || loading}
                onClick={() => preset('8.8.8.8')}
              >
                Example IPv4
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!interactive || loading}
                onClick={() => preset('2606:4700:4700::1111')}
              >
                Example IPv6
              </Button>
            </div>
            <p id="ip-help" className="text-muted-foreground text-xs leading-5">
              Use an address, not a website URL or range. Examples are public
              DNS addresses, not sample results. A successful lookup adds the
              address to this page’s URL; sharing the link shares that address.
            </p>
            {detectionFailed && (
              <p className="text-muted-foreground text-sm" role="status">
                Your IP could not be detected. You can still enter an address or
                choose an example.
              </p>
            )}
            {error && (
              <p
                id="ip-error"
                role="alert"
                className="text-destructive rounded-lg border border-current p-3 text-sm"
              >
                {error}
              </p>
            )}
          </form>
          <div role="status" aria-live="polite" className="text-sm font-medium">
            {!interactive
              ? 'Preparing lookup controls…'
              : loading
                ? `Checking ${ip.trim()}… Results will appear below. You can cancel this request.`
                : error
                  ? invalid
                    ? 'The address needs correction.'
                    : 'The lookup did not complete. Your input is kept for retry.'
                  : result && assessment
                    ? `${assessment.badge}: ${assessment.title}. Report for ${result.data.ip}.`
                    : 'Ready. Results include a qualified verdict, evidence, and missing data.'}
          </div>
          {result && assessment && (
            <>
              <section
                aria-labelledby="ip-verdict"
                className={`space-y-3 rounded-xl border p-5 ${assessment.elevated ? 'border-amber-600/40 bg-amber-500/5' : 'bg-muted/30'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-muted-foreground text-xs">
                    {assessment.badge} · Checked {checkedAt}
                    {result.cached ? ' · Cached provider result' : ''}
                  </p>
                  <code className="break-all text-sm font-semibold">
                    {result.data.ip}
                  </code>
                </div>
                <h2
                  id="ip-verdict"
                  ref={resultHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold"
                >
                  {assessment.title}
                </h2>
                <p className="text-sm leading-6">{assessment.explanation}</p>
                {score?.risk_score != null && (
                  <p className="font-semibold">
                    Risk score: {display(score.risk_score)}
                    {score.band ? ` · ${score.band}` : ''}
                    {score.verdict ? ` · ${score.verdict}` : ''}
                  </p>
                )}
                {assessment.missing.length > 0 && (
                  <p className="text-sm">
                    <strong>Not returned:</strong>{' '}
                    {assessment.missing.join('; ')}. These fields remain
                    unknown.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    value={shareUrl}
                    label="Copy link"
                    variant="outline"
                  />
                  <CopyButton
                    value={JSON.stringify(result, null, 2)}
                    label="Copy JSON"
                    variant="outline"
                  />
                </div>
                {ip.trim() !== result.data.ip && (
                  <p className="text-sm font-medium">
                    The input has changed. This report still describes{' '}
                    {result.data.ip}; run a lookup to check the new address.
                  </p>
                )}
              </section>
              <div className="grid min-w-0 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Proxy &amp; risk signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="text-sm">
                      <Metric name="Proxy" value={classification?.is_proxy} />
                      <Metric name="VPN" value={classification?.is_vpn} />
                      <Metric name="Tor" value={classification?.is_tor} />
                      <Metric
                        name="Datacenter"
                        value={classification?.is_datacenter}
                      />
                      <Metric
                        name="Threat level"
                        value={classification?.threat_level}
                      />
                      <Metric
                        name="Provider action"
                        value={score?.recommended_action}
                      />
                    </dl>
                    <p className="text-muted-foreground mt-3 text-xs leading-5">
                      “Not flagged” means this provider returned false. “Not
                      returned” means unknown. Neither establishes a trusted
                      connection.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Network &amp; routing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="text-sm">
                      <Metric
                        name="ASN"
                        value={network?.asn ?? routing?.origin_asn}
                      />
                      <Metric
                        name="Organization"
                        value={network?.org ?? network?.owner}
                      />
                      <Metric
                        name="Category"
                        value={network?.category ?? classification?.usage_type}
                      />
                      <Metric
                        name="Service role"
                        value={network?.service_role}
                      />
                      <Metric name="Prefix" value={routing?.prefix} />
                      <Metric name="RPKI" value={routing?.rpki_status} />
                    </dl>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Approximate location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="text-sm">
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
                          typeof location?.latitude === 'number' &&
                          typeof location.longitude === 'number'
                            ? `${location.latitude}, ${location.longitude}`
                            : undefined
                        }
                      />
                    </dl>
                    <p className="text-muted-foreground mt-3 text-xs leading-5">
                      Network location is approximate and cannot locate a person
                      or a household.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Returned evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {signals.length ? (
                    <ul className="space-y-3">
                      {signals.map((signal, index) => (
                        <li
                          key={index}
                          className="bg-muted/40 space-y-2 rounded-lg p-3"
                        >
                          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                            <ShieldAlert
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            {signal.label ?? 'Evidence signal'}
                            <span className="text-muted-foreground font-normal">
                              {[
                                signal.severity,
                                signal.confidence &&
                                  `${signal.confidence} confidence`,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </p>
                          {signal.description && (
                            <p className="text-muted-foreground text-sm leading-6">
                              {signal.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-6">
                      The provider returned no evidence rows. This does not
                      establish that the address is benign. Review the
                      classification fields and any missing data above.
                    </p>
                  )}
                  <Link
                    className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                    href="/ip-lookup/how-to-tell-if-an-ip-is-a-proxy"
                  >
                    How to interpret conflicting proxy signals
                  </Link>
                </CardContent>
              </Card>
              <details className="rounded-lg border p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Method, freshness &amp; lookup limits
                </summary>
                <div className="text-muted-foreground space-y-3 pt-3 text-sm leading-6">
                  <p>
                    Intelligence comes from IPbot through the CreepJS API.
                    Standard responses may be cached for up to 24 hours;
                    high-risk responses for up to 1 hour. The time above is when
                    this browser received the result, not when every provider
                    signal was measured.
                  </p>
                  <p>
                    Remaining today:{' '}
                    {result.rateLimit?.remaining ?? 'Not reported'} /{' '}
                    {result.rateLimit?.limit ?? 'Not reported'}.{' '}
                    {result.rateLimit?.reset
                      ? `Resets ${new Date(result.rateLimit.reset * 1000).toLocaleString()}.`
                      : 'Reset time not returned.'}
                  </p>
                  <p>
                    The queried IP is used by the API and its provider and may
                    be cached. IP values and report bodies are excluded from
                    product analytics.{' '}
                    <Link href="/privacy" className="underline">
                      Data handling
                    </Link>
                    .
                  </p>
                </div>
              </details>
            </>
          )}
        </section>
        {result && !loading && !error && <IpPartnerRecommendations />}
        <details className="section-anchor rounded-xl border p-4">
          <summary className="cursor-pointer font-semibold">
            Check a list of IPs · token required
          </summary>
          <div className="pt-4">
            <IpBatchWorkspace />
          </div>
        </details>
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />A risk score
          is a provider signal, not a fraud probability or a decision to block
          someone.
        </p>
      </div>
    </PartnerTrackingProvider>
  );
}
