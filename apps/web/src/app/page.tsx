import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Code2,
  Eye,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';
import { Button } from '@/components/ui/button';
import { LiveFingerprintTeaser } from '@/components/home/LiveFingerprintTeaser';
import { LiveIpCard } from '@/components/home/LiveIpCard';
import { SignalGrid } from '@/components/home/SignalGrid';

export const metadata: Metadata = generateMetadata({
  title: 'Browser Fingerprint Checker & IP Risk Analysis',
  description:
    'Run a privacy-first browser fingerprint check, inspect your public IP risk context, and learn which signals websites can observe with CreepJS.',
  path: '/',
});

const AUDIENCES = [
  {
    icon: Eye,
    title: 'For privacy-conscious people',
    body: 'See which browser and network signals are exposed, separate collector coverage from uniqueness, and learn where anti-fingerprinting defenses change the evidence.',
    href: '/checker',
    link: 'Check this browser',
  },
  {
    icon: ShieldCheck,
    title: 'For security teams',
    body: 'Investigate an IP, review proxy and datacenter context, and move into the documented token API when a repeatable operational surface is required.',
    href: '/ip',
    link: 'Open IP tools',
  },
  {
    icon: Code2,
    title: 'For developers',
    body: 'Integrate the small browser SDK, inspect live response contracts in the playground, and build on explicit signals instead of an unexplained black-box probability.',
    href: '/docs',
    link: 'Read developer docs',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webApplication({
            name: 'CreepJS Browser Fingerprint and IP Risk Platform',
            description:
              'Run browser fingerprint checks, inspect IP risk, and learn how fingerprinting signals work.',
            path: '/',
          }),
          structuredData.breadcrumb([{ name: 'Home', url: SITE_CONFIG.url }]),
        ]}
      />

      <div className="bg-background">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,hsl(var(--primary)/0.14),transparent_34%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--muted)/0.45))]"
          />
          <div className="container relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
            <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
              <div className="max-w-4xl space-y-7">
                <div className="text-primary inline-flex items-center gap-2 text-sm font-semibold">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Open, explainable privacy diagnostics
                </div>
                <div className="space-y-5">
                  <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                    Browser Fingerprint Checker &amp; IP Risk Analysis
                  </h1>
                  <p className="text-muted-foreground max-w-3xl text-lg leading-8 md:text-xl">
                    Understand what websites can observe about your browser and
                    network. CreepJS turns dozens of weak signals into a
                    readable report—without pretending coverage is identity or
                    a fraud probability.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="min-h-11">
                    <Link href="/checker">
                      Run browser checker
                      <Fingerprint
                        className="ml-2 h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-11"
                  >
                    <Link href="/ip">
                      Check an IP
                      <Globe2 className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              <aside className="bg-card/90 rounded-xl border p-5 shadow-sm backdrop-blur">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                  Evidence model
                </p>
                <ol className="mt-5 space-y-4">
                  {[
                    ['Observe', 'Browser and network signals'],
                    ['Separate', 'Coverage, risk, and rarity'],
                    ['Explain', 'Evidence and privacy limits'],
                  ].map(([title, detail], index) => (
                    <li key={title} className="flex gap-3">
                      <span className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-muted-foreground text-xs">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl space-y-24 px-4 py-12 md:px-8 md:py-20">
          <section
            id="live-tools"
            className="section-anchor grid gap-6 lg:grid-cols-2"
            aria-label="Live privacy evidence"
          >
            <h2 className="sr-only">Live privacy evidence</h2>
            <LiveFingerprintTeaser />
            <LiveIpCard />
          </section>

          <section
            id="what-is-creepjs"
            className="section-anchor grid gap-8 border-y py-12 lg:grid-cols-[0.7fr_1.3fr]"
          >
            <div className="space-y-4">
              <Layers3 className="text-primary h-7 w-7" aria-hidden="true" />
              <h2 className="text-3xl font-bold tracking-tight">
                What is CreepJS?
              </h2>
            </div>
            <p className="text-muted-foreground text-lg leading-8">
              CreepJS is the privacy diagnostic and API at creepjs.org. It
              reveals browser and IP-risk signals, explains coverage and
              privacy resistance, and only reports population context after
              anonymous-sample thresholds are met. It is distinct from{' '}
              <a
                href="https://github.com/abrahamjuliot/creepjs"
                target="_blank"
                rel="noreferrer"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Abraham Juliot&apos;s separate open-source CreepJS research
                project
              </a>
              .
            </p>
          </section>

          <section className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-primary text-sm font-semibold">
                One page, evidence first
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                From exposed signal to useful decision
              </h2>
              <p className="text-muted-foreground leading-7">
                Browser fingerprinting does not depend on one magical value.
                Sites combine rendering behavior, device hints, locale,
                storage support, accessibility preferences, privacy resistance,
                and network context. CreepJS keeps those dimensions visible so
                you can inspect why a conclusion exists.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
              {[
                {
                  icon: Fingerprint,
                  title: 'Browser exposure',
                  body: 'Run standards-based collectors locally and inspect the returned values, hashes, timing, failures, and consistency warnings.',
                },
                {
                  icon: Globe2,
                  title: 'Network context',
                  body: 'Separate free geolocation and ASN context from optional proxy, VPN, hosting, and abuse-risk enrichment.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Honest interpretation',
                  body: 'Treat coverage as completion, not uniqueness. Population rarity stays suppressed while the baseline is too small.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <article key={title} className="bg-card min-h-52 p-6">
                  <Icon className="text-primary h-6 w-6" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-6">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-anchor space-y-8" id="who-is-it-for">
            <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div className="space-y-3">
                <Users className="text-primary h-7 w-7" aria-hidden="true" />
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Built for investigation and learning
                </h2>
              </div>
              <p className="text-muted-foreground leading-7">
                Start with a browser or single-IP check, then move to the
                token API, playground, or SDK when the same evidence needs to
                fit a product or security process. Tokens remain in the client
                session; CreepJS does not sell fingerprint profiles.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {AUDIENCES.map(({ icon: Icon, title, body, href, link }) => (
                <article
                  key={title}
                  className="group flex min-h-64 flex-col rounded-xl border p-6 transition-colors hover:border-primary/40"
                >
                  <Icon className="text-primary h-6 w-6" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="text-muted-foreground mt-3 flex-1 text-sm leading-6">
                    {body}
                  </p>
                  <Link
                    href={href}
                    className="text-primary mt-5 inline-flex items-center text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link}
                    <ArrowRight
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-slate-950 grid gap-8 rounded-2xl p-7 text-slate-100 md:p-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-4">
              <Braces className="h-7 w-7 text-blue-300" aria-hidden="true" />
              <h2 className="text-3xl font-bold tracking-tight">
                Privacy is a data boundary
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p>
                The browser collector and diagnostic ID run locally. The full
                raw report is not uploaded by the homepage. The own-IP card
                requests the existing public endpoint, where Cloudflare request
                metadata supplies free geolocation and paid risk data may
                gracefully degrade.
              </p>
              <p>
                When a checker requests population context, only a bounded
                subset of derived or coarse browser values is used. Aggregate
                buckets are protected by k-anonymity suppression, and a small
                sample is never presented as a convincing rarity percentage.
              </p>
            </div>
          </section>

          <SignalGrid />
        </div>
      </div>

      <SeoInternalLinks
        currentPath="/"
        title="CreepJS tools and references"
        description="Start with the live checker, then inspect individual browser fingerprint signals, API docs, and IP risk analysis pages."
      />
    </>
  );
}
