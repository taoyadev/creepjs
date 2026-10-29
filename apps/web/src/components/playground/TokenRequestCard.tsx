'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  const [show, setShow] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!busy) void onSubmit();
  };
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle as="h2" className="text-base">
          1. Add an API token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <label htmlFor="playground-token" className="sr-only">
          API token
        </label>
        <div className="flex min-w-0 gap-2">
          <Input
            id="playground-token"
            type={show ? 'text' : 'password'}
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            disabled={busy}
            className="min-w-0 flex-1 font-mono"
            placeholder="Paste your token"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="playground-token-help"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={show ? 'Hide token' : 'Show token'}
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            {show ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <CopyButton
            value={token.trim()}
            variant="outline"
            disabled={!token.trim()}
            ariaLabel="Copy API token"
            successMessage="API token copied"
          />
        </div>
        <p
          id="playground-token-help"
          className="text-muted-foreground text-xs leading-5"
        >
          Kept in this tab’s memory only. Reload to clear it.
        </p>
        <details>
          <summary className="cursor-pointer text-sm font-medium">
            Need a token? Request one
          </summary>
          <form onSubmit={submit} className="space-y-3 border-t pt-3">
            <label
              htmlFor="playground-email"
              className="block text-sm font-medium"
            >
              Email address
            </label>
            <Input
              id="playground-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              maxLength={254}
              disabled={busy}
              aria-describedby="token-request-help"
            />
            <p
              id="token-request-help"
              className="text-muted-foreground text-xs leading-5"
            >
              The API stores this address with the token. The token is returned
              here, not emailed. Tokens for the same inbox share the daily
              allowance.
            </p>
            <Button
              type="submit"
              disabled={busy || !email.trim()}
              className="w-full"
            >
              {requesting ? 'Requesting token…' : 'Generate token'}
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}
