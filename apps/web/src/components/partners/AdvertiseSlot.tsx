'use client';

import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  PanelLeft,
  Plus,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiError, fetchJson } from '@/lib/api-client';
import { trackEvent } from '@/lib/analytics';

const CONTACT_EMAIL = 'hello@creepjs.org';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string };

export function AdvertiseSlot({
  openSpots,
  totalSpots,
}: {
  openSpots: number;
  totalSpots: number;
}) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.kind === 'sending') return;
    setState({ kind: 'sending' });
    try {
      await fetchJson('/v1/sponsor-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          ...(website.trim() ? { website: website.trim() } : {}),
        }),
      });
      trackEvent('button_clicked', {
        label: 'advertise-submit',
        section: 'partner-sidebar',
      });
      setState({ kind: 'sent', email: email.trim() });
    } catch (error) {
      setState({
        kind: 'error',
        message:
          error instanceof ApiError && error.status === 400
            ? 'Check the email and website.'
            : error instanceof ApiError && error.status === 429
              ? error.message
              : 'We could not send your request.',
      });
    }
  };

  const tiles = [
    { icon: Eye, value: 'High-intent', label: 'People checking their IP' },
    { icon: PanelLeft, value: 'Every page', label: 'Desktop sidebar slot' },
  ];

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open)
          trackEvent('button_clicked', {
            label: 'advertise-open',
            section: 'partner-sidebar',
          });
      }}
    >
      <DialogTrigger
        aria-label="Advertise here"
        title="Advertise here"
        className="text-muted-foreground hover:border-primary/50 hover:text-primary focus-visible:ring-ring grid min-h-[5.25rem] w-full place-items-center rounded-xl border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl gap-6 overflow-y-auto sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-2xl">Advertise on CreepJS</DialogTitle>
          <DialogDescription>
            Put your product beside IP and browser fingerprint checks.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid grid-cols-3 gap-3">
          {tiles.map(({ icon: Icon, value, label }) => (
            <li
              key={value}
              className="bg-muted/40 flex flex-col items-center gap-1 rounded-lg border p-3 text-center"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-semibold">{value}</span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </li>
          ))}
          <li className="border-primary/30 bg-primary/5 flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
            <Zap className="text-primary h-5 w-5" aria-hidden="true" />
            <span className="text-primary text-sm font-semibold tabular-nums">
              {openSpots}/{totalSpots}
            </span>
            <span className="text-muted-foreground text-xs">Spots open</span>
          </li>
        </ul>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">How it works</h3>
          <p className="text-muted-foreground text-sm leading-6">
            Your name, one line and a link sit in a fixed sidebar slot on
            desktop pages, labeled Sponsored. Sponsors never change IP or
            fingerprint results.
          </p>
        </div>

        {state.kind === 'sent' ? (
          <p
            role="status"
            className="bg-muted/40 flex items-start gap-2 rounded-lg border p-4 text-sm leading-6"
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              Thanks. We will email{' '}
              <span className="font-semibold [overflow-wrap:anywhere]">
                {state.email}
              </span>{' '}
              with pricing and current traffic.
            </span>
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="advertise-email" className="text-sm font-medium">
                Work email
              </label>
              <Input
                id="advertise-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                maxLength={254}
                disabled={state.kind === 'sending'}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="advertise-website"
                className="text-sm font-medium"
              >
                Website{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="advertise-website"
                type="url"
                inputMode="url"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://"
                autoComplete="url"
                maxLength={200}
                disabled={state.kind === 'sending'}
              />
            </div>
            {state.kind === 'error' && (
              <p role="alert" className="text-destructive text-sm">
                {state.message} You can also email{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Advertising%20on%20CreepJS`}
                  className="underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 font-semibold"
              disabled={state.kind === 'sending' || !email.trim()}
            >
              {state.kind === 'sending' ? 'Sending…' : 'Get pricing'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-muted-foreground text-xs leading-5">
              We use this address only to reply about advertising.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
