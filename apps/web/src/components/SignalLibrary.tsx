'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FingerprintTechnique } from '@/lib/seo-routes';

export function SignalLibrary({
  techniques,
}: {
  techniques: readonly FingerprintTechnique[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(
    () => [...new Set(techniques.map((item) => item.category))].sort(),
    [techniques]
  );
  const needle = query.trim().toLowerCase();
  const visible = techniques.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      `${item.name} ${item.description} ${item.slug} ${item.category}`
        .toLowerCase()
        .includes(needle)
  );
  return (
    <section aria-label="Find a browser signal" className="space-y-5">
      <div className="bg-card space-y-4 rounded-xl border p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="signal-search">
              Find a signal
            </label>
            <Input
              id="signal-search"
              type="search"
              placeholder="Try canvas, fonts, storage, or motion"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-describedby="signal-count"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signal-category" className="text-sm font-semibold">
              Category
            </label>
            <select
              id="signal-category"
              className="bg-background border-input h-11 w-full rounded-md border px-3 text-base md:text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-2"
          aria-label="Common investigations"
        >
          {[
            ['Graphics', 'Check rendering'],
            ['Accessibility', 'Check display preferences'],
            ['Network', 'Check network exposure'],
            ['Privacy', 'Check privacy resistance'],
          ].map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={category === value ? 'secondary' : 'outline'}
              aria-pressed={category === value}
              onClick={() => {
                setCategory(value);
                setQuery('');
              }}
            >
              {label}
            </Button>
          ))}
          {(query || category !== 'all') && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
      <p
        id="signal-count"
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {visible.length} of {techniques.length} signals
        {needle ? ` matching “${query.trim()}”` : ''}. Open one to view its
        result and limits.
      </p>
      {visible.length === 0 ? (
        <div className="space-y-3 rounded-lg border p-5">
          <h2 className="font-semibold">No signals match these filters</h2>
          <p className="text-muted-foreground text-sm">
            Try a browser API name, a broader term, or another category.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
          >
            Show all signals
          </Button>
        </div>
      ) : (
        <div className="space-y-7">
          {categories.map((group) => {
            const items = visible.filter((item) => item.category === group);
            if (!items.length) return null;
            return (
              <section
                key={group}
                aria-label={`${group} signals`}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold">
                  {group}{' '}
                  <span className="text-muted-foreground text-sm font-normal">
                    {items.length}
                  </span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/fingerprint/${item.slug}`}
                        className="hover:bg-muted/50 block h-full space-y-2 rounded-lg border p-4"
                      >
                        <h3 className="text-primary text-sm font-semibold">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-6">
                          {item.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
