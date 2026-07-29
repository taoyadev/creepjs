import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { FINGERPRINT_TECHNIQUES } from '@/lib/seo-routes';

const CATEGORY_ORDER = [
  'Graphics',
  'Hardware',
  'Browser',
  'System',
  'Audio',
  'Network',
  'Accessibility',
  'Privacy',
] as const;

export function SignalGrid() {
  return (
    <section id="signals" className="section-anchor space-y-8">
      <div className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
        <div className="space-y-3">
          <p className="text-primary text-sm font-semibold">
            Open signal reference
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Inspect the evidence, not just the score
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl leading-7">
          Every technique links to a crawlable, task-focused explanation. The
          registry below is the same source used by CreepJS metadata and signal
          pages, so the homepage cannot drift into a second, hand-maintained
          collector catalog.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CATEGORY_ORDER.map((category) => {
          const techniques = FINGERPRINT_TECHNIQUES.filter(
            (technique) => technique.category === category
          );
          if (techniques.length === 0) return null;

          return (
            <section
              key={category}
              className="overflow-hidden rounded-xl border"
            >
              <div className="bg-muted/50 flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold">{category}</h3>
                <span className="text-muted-foreground text-xs">
                  {techniques.length} signals
                </span>
              </div>
              <ul className="divide-y">
                {techniques.map((technique) => (
                  <li key={technique.slug}>
                    <Link
                      href={`/fingerprint/${technique.slug}`}
                      className="hover:bg-muted/50 focus-visible:ring-ring group flex min-h-12 items-center justify-between gap-4 px-5 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                      title={technique.description}
                    >
                      <span>{technique.name}</span>
                      <ArrowUpRight
                        className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
