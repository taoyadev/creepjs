'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { observePartnerImpression } from './partner-observation';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { PartnerPlacement } from '@/lib/proxy-providers';

const SeenEvents = createContext<Set<string> | null>(null);

/** Own this at page level so query changes and card remounts retain dedupe. */
export function PartnerTrackingProvider({ children }: { children: ReactNode }) {
  const seen = useRef(new Set<string>());
  return (
    <SeenEvents.Provider value={seen.current}>{children}</SeenEvents.Provider>
  );
}

export function PartnerTracking({
  providerId,
  placement,
  children,
}: {
  providerId: string;
  placement: PartnerPlacement;
  children: ReactNode;
}) {
  const seen = useContext(SeenEvents);
  const ref = useRef<HTMLDivElement>(null);
  const emit = (name: 'partner_impression' | 'link_clicked') => {
    const key = `${name}:${placement}:${providerId}`;
    if (!seen || seen.has(key)) return;
    seen.add(key);
    trackEvent(name, { label: providerId, section: placement });
  };

  useEffect(() => {
    const node = ref.current;
    if (!node || !seen || typeof IntersectionObserver === 'undefined') return;
    const key = `partner_impression:${placement}:${providerId}`;
    if (seen.has(key)) return;
    return observePartnerImpression(node, () => {
      if (seen.has(key)) return;
      seen.add(key);
      trackEvent('partner_impression', {
        label: providerId,
        section: placement,
      });
    });
  }, [seen, providerId, placement]);

  return (
    <div
      ref={ref}
      data-partner-id={providerId}
      data-partner-placement={placement}
      onClick={(event) => {
        if ((event.target as Element).closest('a[data-partner-outbound]'))
          emit('link_clicked');
      }}
      onAuxClick={(event) => {
        if (
          event.button === 1 &&
          (event.target as Element).closest('a[data-partner-outbound]')
        )
          emit('link_clicked');
      }}
    >
      {children}
    </div>
  );
}
