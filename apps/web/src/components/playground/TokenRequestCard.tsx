'use client';

import type { FormEvent } from 'react';
import { KeyRound, Play } from 'lucide-react';

import { analytics } from '@/lib/analytics';
import { CopyButton } from '@/components/CopyButton';
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
import { Skeleton } from '@/components/ui/skeleton';

interface TokenRequestCardProps {
  email: string;
  token: string;
  busy: boolean;
  requesting: boolean;
  onEmailChange: (email: string) => void;
  onTokenChange: (token: string) => void;
  onSubmit: () => Promise<void>;
}

export function TokenRequestCard({
  email,
  token,
  busy,
  requesting,
  onEmailChange,
  onTokenChange,
  onSubmit,
}: TokenRequestCardProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
          1. Request a token
        </CardTitle>
        <CardDescription>
          Enter an email address, then use the returned token in this session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="playground-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>
            <Input
              id="playground-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={busy || !email}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" aria-hidden="true" />
            {requesting ? 'Generating…' : 'Generate token'}
          </Button>

          <div>
            <label
              htmlFor="playground-token"
              className="mb-2 block text-sm font-medium"
            >
              API token
            </label>
            {requesting && !token ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex min-w-0 gap-2">
                <Input
                  id="playground-token"
                  type="text"
                  value={token}
                  onChange={(event) => onTokenChange(event.target.value)}
                  className="min-w-0 flex-1 font-mono"
                  placeholder="cfp_..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <CopyButton
                  value={token}
                  variant="outline"
                  size="icon"
                  disabled={!token}
                  ariaLabel="Copy API token"
                  successMessage="API token copied"
                  onCopied={() =>
                    analytics.track.buttonClicked({
                      buttonLabel: 'copy_api_token',
                      section: 'playground',
                    })
                  }
                />
              </div>
            )}
          </div>

          {token && !requesting && (
            <Badge
              variant="secondary"
              className="justify-start whitespace-normal px-3 py-2 text-xs"
              role="status"
              aria-live="polite"
            >
              Token ready for the fingerprint request and code examples.
            </Badge>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
