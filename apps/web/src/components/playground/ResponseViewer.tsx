'use client';

import React, { useEffect, useRef } from 'react';

import { ApiResponseSkeleton } from '@/components/ApiResponseSkeleton';
import { CopyButton } from '@/components/CopyButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface PlaygroundResponse {
  body: string;
  tone: 'idle' | 'success' | 'error' | 'empty' | 'partial';
  endpoint?: string;
  status?: number;
  durationMs?: number;
  hint?: string;
}

interface ResponseViewerProps {
  response: PlaygroundResponse;
  loading: boolean;
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!loading && response.tone !== 'idle') title.current?.focus();
  }, [loading, response]);
  if (loading) {
    return <ApiResponseSkeleton />;
  }

  const isError = response.tone === 'error';
  const statusText =
    response.tone === 'idle'
      ? 'No request has run yet.'
      : response.tone === 'partial'
        ? 'The request returned a partial result.'
        : response.tone === 'empty'
          ? 'The API returned no usable result.'
          : isError
            ? 'The request failed. Review the response body.'
            : 'The request completed successfully.';

  return (
    <Card aria-labelledby="playground-response-title" className="min-h-64">
      <CardHeader>
        <CardTitle
          as="h2"
          id="playground-response-title"
          ref={title}
          tabIndex={-1}
        >
          API response
        </CardTitle>
        <CardDescription>
          Formatted response from the latest request.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-3">
        <p
          className={
            isError
              ? 'text-destructive text-sm font-medium'
              : 'text-muted-foreground text-sm'
          }
          role={isError ? 'alert' : 'status'}
          aria-live={isError ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          {statusText}
        </p>
        {(response.endpoint ||
          response.status ||
          response.durationMs != null) && (
          <p className="text-muted-foreground break-words font-mono text-xs">
            {[
              response.endpoint,
              response.status && `HTTP ${response.status}`,
              response.durationMs != null && `${response.durationMs} ms`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {response.hint && <p className="text-sm leading-6">{response.hint}</p>}
        <pre
          className="bg-muted max-h-96 max-w-full overflow-auto rounded p-4 font-mono text-xs"
          tabIndex={0}
          aria-label="API response body"
        >
          <code>
            {response.body || 'Response will appear here after testing.'}
          </code>
        </pre>
        {response.body && (
          <CopyButton
            value={response.body}
            label="Copy response"
            variant="outline"
          />
        )}
      </CardContent>
    </Card>
  );
}
