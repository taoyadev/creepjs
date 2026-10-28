'use client';

import { Terminal } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EndpointRunnerProps {
  fingerprintId?: string;
  fingerprintLoading: boolean;
  fingerprintFailed: boolean;
  busy: boolean;
  running: boolean;
  canRun: boolean;
  onRun: () => Promise<void>;
}

export function EndpointRunner({
  fingerprintId,
  fingerprintLoading,
  fingerprintFailed,
  busy,
  running,
  canRun,
  onRun,
}: EndpointRunnerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" aria-hidden="true" />
          2. Run POST /v1/fingerprint
        </CardTitle>
        <CardDescription>
          Collect this browser&apos;s fingerprint locally and submit it with the
          current token.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Current fingerprint ID
          </p>
          {fingerprintLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <code className="bg-muted block max-w-full break-all rounded p-3 font-mono text-xs">
              {fingerprintId ??
                (fingerprintFailed
                  ? 'Unavailable'
                  : 'Collected when you run the test')}
            </code>
          )}
        </div>

        {fingerprintFailed && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>
              Fingerprint collection failed in this browser. Run the test again
              to retry.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => void onRun()}
          disabled={busy || !canRun}
          className="w-full"
        >
          <Terminal className="mr-2 h-4 w-4" aria-hidden="true" />
          {running
            ? 'Testing…'
            : fingerprintLoading
              ? 'Collecting fingerprint…'
              : 'Test API now'}
        </Button>
      </CardContent>
    </Card>
  );
}
