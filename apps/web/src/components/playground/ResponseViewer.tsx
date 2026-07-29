import React from 'react';

import { ApiResponseSkeleton } from '@/components/ApiResponseSkeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface PlaygroundResponse {
  body: string;
  tone: 'idle' | 'success' | 'error';
}

interface ResponseViewerProps {
  response: PlaygroundResponse;
  loading: boolean;
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  if (loading) {
    return <ApiResponseSkeleton />;
  }

  const isError = response.tone === 'error';
  const statusText =
    response.tone === 'idle'
      ? 'No request has run yet.'
      : isError
        ? 'The request failed. Review the response body.'
        : 'The request completed successfully.';

  return (
    <Card aria-labelledby="playground-response-title">
      <CardHeader>
        <CardTitle id="playground-response-title">API response</CardTitle>
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
        <pre
          className="bg-muted max-h-96 max-w-full overflow-auto rounded p-4 font-mono text-xs"
          tabIndex={0}
          aria-label="API response body"
        >
          <code>
            {response.body || 'Response will appear here after testing.'}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}
