'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'scan', label: 'Live scan' },
  { id: 'trust', label: 'Trust report' },
  { id: 'history', label: 'Saved scans' },
  { id: 'what-does-the-checker-report', label: 'Report' },
  { id: 'signals', label: 'Signals' },
  { id: 'how-it-works', label: 'Method' },
  { id: 'privacy', label: 'Privacy' },
] as const;

export function CheckerSectionNav() {
  const [activeId, setActiveId] = useState<(typeof SECTIONS)[number]['id']>(
    SECTIONS[0].id
  );

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveId(visible.target.id as (typeof SECTIONS)[number]['id']);
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.15, 0.4],
      }
    );

    const observed = new WeakSet<Element>();
    let found = 0;
    const observeAvailable = () => {
      for (const { id } of SECTIONS) {
        const element = document.getElementById(id);
        if (element && !observed.has(element)) {
          observed.add(element);
          observer.observe(element);
          found += 1;
        }
      }
      if (found === SECTIONS.length) additions.disconnect();
    };
    // The trust report and saved scans render only after the first scan
    // finishes, so pick them up when they enter the DOM.
    const additions = new MutationObserver(observeAvailable);
    additions.observe(document.getElementById('scan') ?? document.body, {
      childList: true,
      subtree: true,
    });
    observeAvailable();
    return () => {
      additions.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Checker sections"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-16 z-30 border-b backdrop-blur"
    >
      <div className="container mx-auto max-w-7xl overflow-x-auto px-4 md:px-8">
        <div className="flex min-w-max gap-1 py-2">
          {SECTIONS.map((section) => {
            const active = section.id === activeId;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setActiveId(section.id)}
                className={cn(
                  'focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
                  active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {section.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
