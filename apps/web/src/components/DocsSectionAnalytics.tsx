'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface DocsSectionAnalyticsProps {
  rootId: string;
  defaultSection: string;
}

export function DocsSectionAnalytics({
  rootId,
  defaultSection,
}: DocsSectionAnalyticsProps) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    trackEvent('docs_viewed', { section: defaultSection });

    const onClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const trigger = target.closest<HTMLElement>('[data-docs-tab]');
      const section = trigger?.dataset.docsTab;
      if (!section) return;

      trackEvent('docs_viewed', { section });
    };

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
    };
  }, [defaultSection, rootId]);

  return null;
}
