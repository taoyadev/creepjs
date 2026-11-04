'use client';

import { Eye, Mail, PanelLeft, Plus, Zap } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CopyButton } from '@/components/CopyButton';
import { trackEvent } from '@/lib/analytics';

const CONTACT_EMAIL = 'hello@creepjs.org';
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Advertising on CreepJS'
)}`;

export function AdvertiseSlot({
  openSpots,
  totalSpots,
}: {
  openSpots: number;
  totalSpots: number;
}) {
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
            Your logo, name, one line and a link sit in a fixed sidebar slot on
            every desktop page. Sponsors never change IP or fingerprint results.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm">
            Email us for pricing and current traffic:{' '}
            <span className="font-semibold">{CONTACT_EMAIL}</span>
          </p>
          <div className="flex gap-2">
            <a
              href={MAILTO}
              onClick={() =>
                trackEvent('button_clicked', {
                  label: 'advertise-email',
                  section: 'partner-sidebar',
                })
              }
              className={buttonVariants({
                size: 'lg',
                className: 'flex-1 gap-2 font-semibold',
              })}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email {CONTACT_EMAIL}
            </a>
            <CopyButton
              value={CONTACT_EMAIL}
              variant="outline"
              ariaLabel="Copy email address"
              successMessage="Email address copied"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
