'use client';

import Link from 'next/link';
import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  Download,
  KeyRound,
  Layers3,
  Loader2,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, fetchJson } from '@/lib/api-client';
import {
  buildIpBatchCsv,
  parseIpBatchInput,
  validateIpBatchInput,
  type IpBatchResponse,
} from '@/lib/ip-batch';
import { IpBatchResultsTable } from './IpBatchResultsTable';

function requestErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error
      ? error.message
      : 'Unable to reach the CreepJS API.';
  }

  const resetIn =
    typeof error.body === 'object' &&
    error.body !== null &&
    'resetIn' in error.body &&
    typeof (error.body as { resetIn: unknown }).resetIn === 'number'
      ? (error.body as { resetIn: number }).resetIn
      : error.retryAfter;
  return resetIn
    ? `${error.message}. Try again in about ${resetIn} seconds.`
    : error.message;
}

export function IpBatchWorkspace() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<IpBatchResponse | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const parsed = useMemo(() => parseIpBatchInput(input), [input]);
  const validationErrors = useMemo(
    () => validateIpBatchInput(parsed, token.trim().length > 0),
    [parsed, token]
  );

  useEffect(() => {
    if (response) resultsHeadingRef.current?.focus();
  }, [response]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationErrors.length > 0 || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await fetchJson<IpBatchResponse>('/v1/ip/batch', {
        method: 'POST',
        retry: false,
        timeoutMs: 60_000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-Token': token.trim(),
        },
        body: JSON.stringify({ ips: parsed.entries }),
      });
      setResponse(data);
    } catch (requestError) {
      setError(requestErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!response) return;
    const csv = buildIpBatchCsv(response);
    const blobUrl = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = `creepjs-ip-batch-${new Date()
      .toISOString()
      .replace(/[:.]/gu, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
    toast.success('CSV exported');
  };

  return (
    <section id="batch" className="section-anchor space-y-6">
      <div className="max-w-3xl space-y-3">
        <Badge variant="outline">
          <Layers3 className="h-4 w-4 text-blue-500" />
          Token workspace
        </Badge>
        <h2 className="text-2xl font-semibold md:text-3xl">
          Check an IP list in one batch
        </h2>
        <p className="text-muted-foreground leading-7">
          Submit up to 50 IPv4 or IPv6 addresses. CreepJS reserves one daily
          lookup unit per unique valid address, processes them serially, and
          stops safely if the intelligence provider becomes unavailable.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            Batch lookup
          </CardTitle>
          <CardDescription>
            Your token and address list stay in this tab&apos;s memory. They are
            not added to the URL, browser storage, analytics, or server logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="batch-api-token" className="text-sm font-medium">
                API token
              </label>
              <Input
                id="batch-api-token"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="cfp_…"
                aria-describedby="batch-token-help"
                aria-invalid={token.length > 0 && token.trim().length === 0}
              />
              <p
                id="batch-token-help"
                className="text-muted-foreground text-xs"
              >
                Need a token?{' '}
                <Link
                  href="/playground"
                  className="text-foreground underline underline-offset-4"
                >
                  Request one in the API playground
                </Link>
                . It is never saved or exported.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="batch-ip-list" className="text-sm font-medium">
                IP addresses
              </label>
              <Textarea
                id="batch-ip-list"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-h-40 font-mono"
                placeholder={'8.8.8.8\n1.1.1.1\n2001:4860:4860::8888'}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby="batch-input-help batch-input-count"
                aria-invalid={
                  parsed.entries.length > 50 ||
                  parsed.oversizedEntries.length > 0
                }
              />
              <div className="flex flex-wrap justify-between gap-2 text-xs">
                <p id="batch-input-help" className="text-muted-foreground">
                  Separate entries with commas, spaces, tabs, or new lines. IPv6
                  colons remain intact.
                </p>
                <p
                  id="batch-input-count"
                  className="text-muted-foreground tabular-nums"
                  aria-live="polite"
                >
                  {parsed.entries.length} entries · {parsed.uniqueCount} unique
                  · maximum 50
                </p>
              </div>
            </div>

            {validationErrors.length > 0 &&
              (token.length > 0 || input.length > 0) && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Check the batch input</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {validationErrors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Batch request failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="submit"
                disabled={loading || validationErrors.length > 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {loading ? 'Processing serially…' : 'Run batch lookup'}
              </Button>
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-muted-foreground text-sm"
              >
                {loading
                  ? `Processing ${parsed.uniqueCount} unique addresses serially.`
                  : 'No fake progress: results appear when the bounded request completes.'}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle
                id="batch-results-heading"
                ref={resultsHeadingRef}
                tabIndex={-1}
                className="outline-none"
              >
                Batch results
              </CardTitle>
              <CardDescription>
                {response.successCount} succeeded · {response.failedCount}{' '}
                failed · {response.skippedCount} skipped · {response.quotaCost}{' '}
                lookup units reserved
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={downloadCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export safe CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.aborted && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Partial result</AlertTitle>
                <AlertDescription>
                  Processing stopped after a dependency failure (
                  {response.abortedReason ?? 'provider unavailable'}). Completed
                  and skipped rows remain explicit; retry later
                  {response.retryAfter
                    ? ` after about ${response.retryAfter} seconds`
                    : ''}
                  .
                </AlertDescription>
              </Alert>
            )}
            <IpBatchResultsTable
              response={response}
              labelledBy="batch-results-heading"
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
