'use client';

import { useEffect, useState } from 'react';
import { collectFingerprint, type FingerprintResult } from '@creepjs/core';
import { toast } from 'sonner';

import { trackEvent } from '@/lib/analytics';
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
    const loadFingerprint = async () => {
      setFingerprintLoading(true);
      try {
        const result = await collectFingerprint();
        setFingerprint(result);
      } catch (error) {
        console.error('Failed to collect fingerprint:', error);
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
        trackEvent('api_token_requested', {
          surface: 'playground',
          outcome: 'success',
        });
        toast.success('API token generated', {
          description: `Token has been sent to ${email}`,
        });
      } else if (data.error) {
        trackEvent('api_token_requested', {
          surface: 'playground',
          outcome: 'error',
        });
        toast.error('Failed to generate token', {
          description: data.error,
        });
      }
    } catch (error) {
      setResponse({ body: `Error: ${String(error)}`, tone: 'error' });
      trackEvent('api_token_requested', {
        surface: 'playground',
        outcome: 'error',
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
        trackEvent('tool_run', {
          tool: 'api_request',
          surface: 'playground',
          outcome: 'success',
          status: String(result.status),
        });
        toast.success('API request successful', {
          description: 'Fingerprint data processed successfully.',
        });
      } else {
        trackEvent('tool_run', {
          tool: 'api_request',
          surface: 'playground',
          outcome: 'error',
          status: String(result.status),
        });
        toast.error('API request failed', {
          description: 'Check the response below for details.',
        });
      }
    } catch (error) {
      setResponse({ body: `Error: ${String(error)}`, tone: 'error' });
      trackEvent('tool_run', {
        tool: 'api_request',
        surface: 'playground',
        outcome: 'error',
        status: '0',
      });
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
