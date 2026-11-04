'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  // Keep filters in the URL so Back from a signal page restores them and a
  // filtered list can be shared. The static HTML always shows every signal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('category');
    setQuery(params.get('q')?.slice(0, 100) ?? '');
    if (requested && categories.includes(requested)) setCategory(requested);
  }, [categories]);
  // Write the URL once typing pauses: Safari throws after about 100 history
  // updates in a short window, and Next.js adds one of its own per update.
  const urlWrite = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingWrite = useRef<(() => void) | null>(null);
  useEffect(() => () => clearTimeout(urlWrite.current), []);
  // Opening a signal must not drop a write still waiting for the pause.
  const flushUrl = () => {
    clearTimeout(urlWrite.current);
    pendingWrite.current?.();
  };
  const applyFilters = (nextQuery: string, nextCategory: string) => {
    setQuery(nextQuery);
    setCategory(nextCategory);
    clearTimeout(urlWrite.current);
    const write = () => {
      pendingWrite.current = null;
      const params = new URLSearchParams(window.location.search);
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      else params.delete('q');
      if (nextCategory !== 'all') params.set('category', nextCategory);
      else params.delete('category');
      const search = params.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
      );
    };
    pendingWrite.current = write;
    urlWrite.current = setTimeout(write, 300);
  };
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
              onChange={(event) => applyFilters(event.target.value, category)}
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
              onChange={(event) => applyFilters(query, event.target.value)}
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
              onClick={() => applyFilters('', value)}
            >
              {label}
            </Button>
          ))}
          {(query || category !== 'all') && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => applyFilters('', 'all')}
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
            onClick={() => applyFilters('', 'all')}
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
                        onClick={flushUrl}
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
