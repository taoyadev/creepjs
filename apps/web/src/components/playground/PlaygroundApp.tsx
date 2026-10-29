'use client';

import { useEffect, useRef, useState } from 'react';
import type { FingerprintResult } from '@creepjs/core';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';
import { ApiError, fetchJson } from '@/lib/api-client';
import { signalJson } from '@/lib/signal-result';
import { Button } from '@/components/ui/button';
import { CodeSnippets } from './CodeSnippets';
import { EndpointRunner } from './EndpointRunner';
import { ResponseViewer, type PlaygroundResponse } from './ResponseViewer';
import { TokenRequestCard } from './TokenRequestCard';

type ActiveRequest = 'token' | 'fingerprint' | null;

function requestHint(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return 'The token was rejected. Replace it with a valid token and retry; your collected snapshot is kept in memory.';
    if (error.status === 429)
      return error.retryAfter
        ? `Request limit reached. Wait ${error.retryAfter} seconds before retrying. Existing tokens share the same daily allowance.`
        : 'Daily request limit reached. Existing tokens share the same allowance; retry after it resets.';
    if (error.status === 413)
      return 'The fingerprint exceeds the 128 KiB API limit. Inspect the collected payload before retrying.';
    if (error.status === 400)
      return 'The API rejected this input. Check the field values and response details before retrying.';
    if (error.status === 408)
      return 'The request timed out. It may have reached the server. Review the result before manually retrying; requests are never replayed automatically.';
    if (error.status >= 500)
      return 'The API is temporarily unavailable. Keep your token and try again later.';
  }
  return 'The API could not be reached. Check your connection and retry. Your token and inputs remain in this tab.';
}

export function PlaygroundApp() {
  const [apiToken, setApiToken] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState<PlaygroundResponse>({
    body: '',
    tone: 'idle',
  });
  const [activeRequest, setActiveRequest] = useState<ActiveRequest>(null);
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(
    null
  );
  const [fingerprintLoading, setFingerprintLoading] = useState(false);
  const [fingerprintFailed, setFingerprintFailed] = useState(false);
  const [includeToken, setIncludeToken] = useState(false);
  const current = useRef<AbortController | null>(null);
  const lock = useRef(false);
  useEffect(
    () => () => {
      current.current?.abort();
    },
    []
  );

  const execute = async (kind: Exclude<ActiveRequest, null>) => {
    if (lock.current) return;
    if (kind === 'fingerprint' && !apiToken.trim()) return;
    lock.current = true;
    const controller = new AbortController();
    current.current = controller;
    const started = performance.now();
    const endpoint =
      kind === 'token' ? 'POST /v1/token' : 'POST /v1/fingerprint';
    setActiveRequest(kind);
    setResponse({ body: '', tone: 'idle', endpoint });
    try {
      let collected = fingerprint;
      if (kind === 'fingerprint' && !collected) {
        setFingerprintLoading(true);
        setFingerprintFailed(false);
        try {
          const { collectFingerprint } = await import('@creepjs/core');
          if (controller.signal.aborted) return;
          collected = await collectFingerprint();
          if (controller.signal.aborted) return;
          setFingerprint(collected);
        } catch {
          if (!controller.signal.aborted) setFingerprintFailed(true);
          throw new Error('collection');
        } finally {
          if (current.current === controller) setFingerprintLoading(false);
        }
      }
      if (controller.signal.aborted) return;
      const data = await fetchJson<Record<string, unknown>>(
        kind === 'token' ? '/v1/token' : '/v1/fingerprint',
        {
          method: 'POST',
          retry: false,
          timeoutMs: 15000,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(kind === 'fingerprint'
              ? { 'X-API-Token': apiToken.trim() }
              : {}),
          },
          body: JSON.stringify(
            kind === 'token' ? { email: email.trim() } : collected
          ),
        }
      );
      if (controller.signal.aborted) return;
      const valid =
        kind === 'token'
          ? typeof data?.token === 'string' && data.token.length > 0
          : typeof data?.fingerprintId === 'string' &&
            Boolean(data.fingerprintId);
      if (!valid) {
        setResponse({
          body: signalJson(data),
          tone: 'empty',
          endpoint,
          status: 200,
          durationMs: Math.round(performance.now() - started),
          hint: `The API returned no usable ${kind === 'token' ? 'token' : 'fingerprint ID'}. Keep your input and retry later.`,
        });
        return;
      }
      if (kind === 'token') setApiToken(String(data.token));
      const partial =
        kind === 'fingerprint' &&
        (!data.data ||
          typeof data.data !== 'object' ||
          typeof data.confidence !== 'number' ||
          typeof data.timestamp !== 'number');
      const visible =
        kind === 'token'
          ? {
              ...data,
              token: '[available in the token field]',
              email: '[provided email]',
            }
          : data;
      setResponse({
        body: signalJson(visible),
        tone: partial ? 'partial' : 'success',
        endpoint,
        status: 200,
        durationMs: Math.round(performance.now() - started),
        hint: partial
          ? 'An ID was returned, but expected report fields are missing. Inspect the available JSON before using this result; your collected snapshot is kept for a later retry.'
          : kind === 'token'
            ? 'Token returned in this tab. Use it in the field on the left or copy it before leaving. No email delivery is performed.'
            : 'The API recalculated the ID from your submitted snapshot. Coverage describes collection, not uniqueness or the probability of fraud. Image payloads are omitted from this response view.',
      });
      if (kind === 'token')
        trackEvent('api_token_requested', {
          surface: 'playground',
          outcome: 'success',
        });
      else
        trackEvent('tool_run', {
          tool: 'api_request',
          surface: 'playground',
          outcome: 'success',
          status: '200',
        });
      toast.success(
        kind === 'token' ? 'API token ready' : 'API request completed'
      );
    } catch (cause) {
      if (controller.signal.aborted) return;
      const collectionError =
        cause instanceof Error && cause.message === 'collection';
      setResponse({
        body: cause instanceof ApiError ? signalJson(cause.body) : '',
        tone: 'error',
        endpoint,
        status: cause instanceof ApiError ? cause.status : undefined,
        durationMs: Math.round(performance.now() - started),
        hint: collectionError
          ? 'Browser collection failed before anything was submitted. Retry or inspect one signal in the signal library; you can keep your privacy settings.'
          : requestHint(cause),
      });
      if (kind === 'token')
        trackEvent('api_token_requested', {
          surface: 'playground',
          outcome: 'error',
        });
      else
        trackEvent('tool_run', {
          tool: 'api_request',
          surface: 'playground',
          outcome: 'error',
          status: String(cause instanceof ApiError ? cause.status : 0),
        });
    } finally {
      if (current.current === controller) {
        setActiveRequest(null);
        setFingerprintLoading(false);
        lock.current = false;
      }
    }
  };
  const busy = activeRequest !== null;
  return (
    <section aria-label="Interactive API workspace" className="space-y-5">
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <TokenRequestCard
            email={email}
            token={apiToken}
            busy={busy}
            requesting={activeRequest === 'token'}
            onEmailChange={setEmail}
            onTokenChange={setApiToken}
            onSubmit={() => execute('token')}
          />
          <EndpointRunner
            fingerprintId={fingerprint?.fingerprintId}
            fingerprintLoading={fingerprintLoading}
            fingerprintFailed={fingerprintFailed}
            busy={busy}
            running={activeRequest === 'fingerprint'}
            canRun={Boolean(apiToken.trim())}
            onRun={() => execute('fingerprint')}
          />
          {busy && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                current.current?.abort();
                setActiveRequest(null);
                lock.current = false;
                setFingerprintLoading(false);
                setResponse({
                  body: '',
                  tone: 'idle',
                  hint: 'Stopped waiting. If the request had already been sent, the server may still process it. Your inputs are kept; no request is automatically retried.',
                });
              }}
            >
              Stop waiting
            </Button>
          )}
          {fingerprint && !busy && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFingerprint(null);
                setFingerprintFailed(false);
              }}
            >
              Discard collected snapshot
            </Button>
          )}
        </div>
        <div className="min-w-0 lg:sticky lg:top-20">
          <ResponseViewer response={response} loading={busy} />
        </div>
      </div>
      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-semibold">
          Copy an integration example
        </summary>
        <div className="space-y-4 pt-4">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={includeToken}
              onChange={(event) => setIncludeToken(event.target.checked)}
              className="h-4 w-4"
            />
            Include my token in the visible and copied examples
          </label>
          <CodeSnippets apiToken={includeToken ? apiToken : ''} />
        </div>
      </details>
    </section>
  );
}
