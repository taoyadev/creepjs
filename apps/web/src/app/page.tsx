import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { LiveFingerprintTeaser } from '@/components/home/LiveFingerprintTeaser';
import { LiveIpCard } from '@/components/home/LiveIpCard';

export const metadata: Metadata = generateMetadata({
  title: 'Browser Fingerprint Checker & IP Risk Analysis',
  description:
    'Run a privacy-first browser fingerprint check, inspect your public IP risk context, and learn which signals websites can observe with CreepJS.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webApplication({
            name: 'CreepJS Browser Fingerprint and IP Risk Platform',
            description:
              'Inspect browser signals and public IP risk with explained results.',
            path: '/',
          }),
          structuredData.breadcrumb([{ name: 'Home', url: SITE_CONFIG.url }]),
        ]}
      />
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-7 md:px-8 md:py-10">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Browser fingerprint &amp; IP check
          </h1>
          <p className="text-muted-foreground leading-7">
            See what this browser exposes and which network you are using. Get
            observed values, missing signals, and explanations before deciding
            what to change.
          </p>
        </header>
        <section
          id="live-tools"
          className="section-anchor grid min-w-0 gap-5 lg:grid-cols-2"
          aria-label="Live privacy evidence"
        >
          <LiveFingerprintTeaser />
          <LiveIpCard />
        </section>
        <nav
          aria-label="Choose your next task"
          className="grid gap-3 border-y py-6 sm:grid-cols-3"
        >
          {[
            [
              '/checker',
              'Compare browser settings',
              'Inspect every collector, save a local scan, and compare changes.',
            ],
            [
              '/ip',
              'Investigate an IP',
              'Check another IPv4 or IPv6 address and read the evidence.',
            ],
            [
              '/playground',
              'Test an integration',
              'Use a token, run a request, and copy a working example.',
            ],
          ].map(([href, title, detail]) => (
            <Link
              key={href}
              href={href}
              className="hover:bg-muted rounded-lg p-4"
            >
              <span className="flex items-center justify-between gap-2 font-semibold">
                {title}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </span>
              <span className="text-muted-foreground mt-2 block text-sm leading-6">
                {detail}
              </span>
            </Link>
          ))}
        </nav>
        <section
          id="what-is-creepjs"
          className="section-anchor max-w-3xl space-y-3 pb-4"
        >
          <h2 className="text-xl font-semibold">How to read these checks</h2>
          <p className="text-muted-foreground text-sm leading-7">
            A fingerprint is a snapshot of observable browser values. Coverage
            measures how much could be collected; it does not measure identity,
            uniqueness, or the probability of fraud. IP location is approximate,
            and missing risk data stays unknown.
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            Full scans include a WebRTC check that contacts Google STUN servers.
            The full checker saves sanitized history in this browser; you can
            clear it there. API submissions happen from the playground when you
            run a request.{' '}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4"
            >
              Review data handling
            </Link>
            .
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            CreepJS.org is this educational diagnostic and API. It is separate
            from{' '}
            <a
              href="https://github.com/abrahamjuliot/creepjs"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Abraham Juliot’s CreepJS research project
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/fingerprint"
              className="text-primary underline underline-offset-4"
            >
              Explore all 55 signals
            </Link>
            <Link
              href="/guide/what-is-browser-fingerprinting"
              className="text-primary underline underline-offset-4"
            >
              Understand fingerprinting
            </Link>
            <Link
              href="/docs"
              className="text-primary underline underline-offset-4"
            >
              SDK &amp; API docs
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
