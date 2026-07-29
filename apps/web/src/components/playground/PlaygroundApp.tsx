'use client';

import { useEffect, useState } from 'react';
import { collectFingerprint, type FingerprintResult } from '@creepjs/core';
import { toast } from 'sonner';

import { analytics } from '@/lib/analytics';
import { SITE_CONFIG } from '@/lib/metadata';

import { CodeSnippets } from './CodeSnippets';
import { EndpointRunner } from './EndpointRunner';
import { ResponseViewer, type PlaygroundResponse } from './ResponseViewer';
import { TokenRequestCard } from './TokenRequestCard';

const API_URL = SITE_CONFIG.apiUrl;

interface TokenResponse {
  token?: string;
  error?: string;
  [key: string]: unknown;
}

type ActiveRequest = 'token' | 'fingerprint' | null;

const INITIAL_RESPONSE: PlaygroundResponse = {
  body: '',
  tone: 'idle',
};

export function PlaygroundApp() {
  const [apiToken, setApiToken] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] =
    useState<PlaygroundResponse>(INITIAL_RESPONSE);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest>(null);
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(
    null
  );
  const [fingerprintLoading, setFingerprintLoading] = useState(true);

  useEffect(() => {
    analytics.pageView('/playground');
    analytics.track.playgroundUsed({ endpoint: '/playground' });

    const loadFingerprint = async () => {
      setFingerprintLoading(true);
      try {
        const result = await collectFingerprint();
        setFingerprint(result);
        analytics.track.fingerprintGenerated({
          confidence: result.confidence,
          method: 'playground',
        });
      } catch (error) {
        console.error('Failed to collect fingerprint:', error);
        analytics.error(error instanceof Error ? error : String(error), {
          page: '/playground',
        });
      } finally {
        setFingerprintLoading(false);
      }
    };

    void loadFingerprint();
  }, []);

  const generateToken = async () => {
    setActiveRequest('token');

    try {
      const result = await fetch(`${API_URL}/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await result.json()) as TokenResponse;
      const token = typeof data.token === 'string' ? data.token : undefined;

      setResponse({
        body: JSON.stringify(data, null, 2),
        tone: token ? 'success' : 'error',
      });

      if (token) {
        setApiToken(token);
        analytics.track.apiTokenRequested({ source: 'playground' });
        analytics.track.formSubmitted({
          formName: 'api_token_request',
          success: true,
        });
        toast.success('API token generated', {
          description: `Token has been sent to ${email}`,
        });
      } else if (data.error) {
        analytics.track.formSubmitted({
          formName: 'api_token_request',
          success: false,
        });
        toast.error('Failed to generate token', {
          description: data.error,
        });
      }
    } catch (error) {
      setResponse({ body: `Error: ${String(error)}`, tone: 'error' });
      analytics.track.formSubmitted({
        formName: 'api_token_request',
        success: false,
      });
      toast.error('Request failed', {
        description: 'Unable to connect to the API server.',
      });
    } finally {
      setActiveRequest(null);
    }
  };

  const testFingerprintApi = async () => {
    if (!fingerprint) {
      setResponse({
        body: 'Error: No fingerprint data available',
        tone: 'error',
      });
      toast.error('No fingerprint available', {
        description: 'Please wait for fingerprint collection to complete.',
      });
      return;
    }

    setActiveRequest('fingerprint');

    try {
      const result = await fetch(`${API_URL}/v1/fingerprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': apiToken,
        },
        body: JSON.stringify(fingerprint),
      });
      const data = (await result.json()) as unknown;

      setResponse({
        body: JSON.stringify(data, null, 2),
        tone: result.ok ? 'success' : 'error',
      });

      if (result.ok) {
        analytics.track.playgroundTest({
          endpoint: '/v1/fingerprint',
          success: true,
        });
        analytics.track.apiCall({
          endpoint: '/v1/fingerprint',
          statusCode: result.status,
          success: true,
        });
        toast.success('API request successful', {
          description: 'Fingerprint data processed successfully.',
        });
      } else {
        analytics.track.playgroundTest({
          endpoint: '/v1/fingerprint',
          success: false,
        });
        analytics.track.apiError({
          endpoint: '/v1/fingerprint',
          statusCode: result.status,
        });
        toast.error('API request failed', {
          description: 'Check the response below for details.',
        });
      }
    } catch (error) {
      setResponse({ body: `Error: ${String(error)}`, tone: 'error' });
      toast.error('Request failed', {
        description: 'Unable to connect to the API server.',
      });
    } finally {
      setActiveRequest(null);
    }
  };

  const busy = activeRequest !== null;

  return (
    <section aria-label="Interactive API workspace">
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <TokenRequestCard
            email={email}
            token={apiToken}
            busy={busy}
            requesting={activeRequest === 'token'}
            onEmailChange={setEmail}
            onTokenChange={setApiToken}
            onSubmit={generateToken}
          />
          <EndpointRunner
            fingerprintId={fingerprint?.fingerprintId}
            fingerprintLoading={fingerprintLoading}
            fingerprintFailed={!fingerprintLoading && !fingerprint}
            busy={busy}
            running={activeRequest === 'fingerprint'}
            canRun={Boolean(apiToken && fingerprint)}
            onRun={testFingerprintApi}
          />
          <ResponseViewer response={response} loading={busy} />
        </div>

        <div className="min-w-0">
          <CodeSnippets apiToken={apiToken} />
        </div>
      </div>
    </section>
  );
}
