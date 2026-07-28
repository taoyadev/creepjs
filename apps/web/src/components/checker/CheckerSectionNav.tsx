'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'scan', label: 'Live scan' },
  { id: 'what-does-the-checker-report', label: 'Report' },
  { id: 'signals', label: 'Signals' },
  { id: 'how-it-works', label: 'Method' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'faq', label: 'FAQ' },
] as const;

export function CheckerSectionNav() {
  const [activeId, setActiveId] = useState<(typeof SECTIONS)[number]['id']>(
    SECTIONS[0].id
  );

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null
    );
    if (elements.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveId(
            visible.target.id as (typeof SECTIONS)[number]['id']
          );
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.15, 0.4],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Checker sections"
      className="bg-background/95 sticky top-16 z-30 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80"
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
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-primary/10 text-primary'
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
