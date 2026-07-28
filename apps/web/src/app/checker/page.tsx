import {
  ArrowDown,
  Eye,
  Fingerprint,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';
import {
  collectorManifest,
  type CollectorManifestEntry,
} from '@creepjs/core';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckerApp } from '@/components/checker/CheckerApp';

const CATEGORY_META: ReadonlyArray<{
  key: CollectorManifestEntry['category'];
  label: string;
  description: string;
}> = [
  {
    key: 'graphics',
    label: 'Graphics rendering',
    description: 'Canvas, WebGL, SVG, text metrics, and CSS rendering.',
  },
  {
    key: 'hardware',
    label: 'Device surface',
    description: 'Screen, color, memory, CPU concurrency, and touch support.',
  },
  {
    key: 'browser',
    label: 'Browser capabilities',
    description: 'Navigator, storage, plugins, platform, and feature support.',
  },
  {
    key: 'system',
    label: 'System context',
    description: 'Fonts, locale, timezone, architecture, and math behavior.',
  },
  {
    key: 'audio',
    label: 'Media and audio',
    description: 'Audio processing, media devices, and speech voices.',
  },
  {
    key: 'accessibility',
    label: 'Display preferences',
    description: 'Contrast, reduced motion, forced colors, and related settings.',
  },
  {
    key: 'privacy',
    label: 'Privacy resistance',
    description: 'Anti-fingerprinting signals, blockers, and consistency checks.',
  },
  {
    key: 'network',
    label: 'Network surface',
    description: 'WebRTC, service workers, and network-exposed capabilities.',
  },
];

const FAQS = [
  {
    question: 'Is a browser fingerprint the same as a cookie?',
    answer:
      'No. A cookie is a stored identifier that you can delete. A fingerprint is derived from browser and device characteristics that may remain similar across sessions. It is probabilistic context, not proof of a person’s identity.',
  },
  {
    question: 'Does a high coverage score mean I am unique?',
    answer:
      'No. Coverage only reports how many collectors completed successfully. Uniqueness requires a sufficiently large comparison population. CreepJS suppresses rarity estimates while the anonymous baseline is below its k-anonymity threshold.',
  },
  {
    question: 'Can private browsing stop fingerprinting?',
    answer:
      'Private browsing mainly isolates history, cookies, and storage. It does not necessarily standardize rendering, hardware, locale, or feature signals. Browser-level anti-fingerprinting defenses and a common configuration usually matter more.',
  },
  {
    question: 'Why can the fingerprint change?',
    answer:
      'Browser updates, display changes, font changes, privacy tools, permissions, and collector failures can alter individual signals. Treat the ID as a diagnostic snapshot rather than a permanent identity.',
  },
] as const;

export default function CheckerPage() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="bg-primary/10 absolute -right-32 -top-40 h-96 w-96 rounded-full blur-3xl"
        />
        <div className="container relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="max-w-3xl space-y-6">
              <div className="text-primary inline-flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Privacy diagnostic · runs automatically
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                  Browser Fingerprint Checker
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed md:text-xl">
                  See the browser, device, rendering, and privacy signals that
                  websites can combine into a fingerprint—then inspect every
                  result without surrendering the page to a loading screen.
                </p>
              </div>
              <a
                href="#scan"
                className="bg-primary text-primary-foreground inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View my live scan
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <aside className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-widest">
                What this report separates
              </div>
              <dl className="grid grid-cols-3 gap-3">
                {[
                  ['Signals', String(collectorManifest.length)],
                  ['Categories', String(CATEGORY_META.length)],
                  ['Storage', 'Local'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-muted/60 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 text-lg font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                Coverage is not uniqueness. Results explain what responded;
                rarity remains hidden until the population baseline is large
                enough to be honest.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl space-y-20 px-4 py-10 md:px-8 md:py-16">
        <section id="scan" className="section-anchor space-y-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div className="space-y-2">
              <p className="text-primary text-sm font-semibold">Live report</p>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Your browser, one signal at a time
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Collection starts after the page becomes idle. You can continue
              reading while the scan fills this fixed task region.
            </p>
          </div>
          <CheckerApp />
        </section>

        <section
          id="what-does-the-checker-report"
          className="section-anchor grid gap-8 border-y py-12 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div className="space-y-4">
            <ScanSearch className="text-primary h-7 w-7" aria-hidden="true" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              What does the CreepJS checker report?
            </h2>
          </div>
          <p className="text-muted-foreground text-base leading-7">
            CreepJS reports which browser APIs respond, the values or hashes
            they expose, collection timing, consistency warnings, and a
            coverage score. It groups those observations into readable signal
            cards so you can distinguish ordinary configuration data from
            privacy resistance or automation indicators. It does not identify
            a person or claim a fraud probability.
          </p>
        </section>

        <section id="signals" className="section-anchor space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-primary text-sm font-semibold">
              Manifest-derived taxonomy
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              The signal surface
            </h2>
            <p className="text-muted-foreground leading-7">
              A fingerprint becomes useful only when many weak observations are
              combined. The checker’s collector manifest currently covers the
              eight families below. Each live card shows the actual value,
              collector timing, and available context rather than collapsing
              everything into one unexplained score.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_META.map((category) => {
              const entries = collectorManifest.filter(
                (entry) => entry.category === category.key
              );
              return (
                <article
                  key={category.key}
                  className="bg-card min-h-48 space-y-4 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold">{category.label}</h3>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                      {entries.length}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-6">
                    {category.description}
                  </p>
                  <p className="text-muted-foreground text-xs leading-5">
                    {entries
                      .slice(0, 5)
                      .map((entry) => entry.label)
                      .join(' · ')}
                    {entries.length > 5 ? ` · +${entries.length - 5}` : ''}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="how-it-works"
          className="section-anchor grid gap-8 lg:grid-cols-3"
        >
          {[
            {
              icon: Eye,
              title: '1. Observe',
              body: 'Collectors ask standards-based browser APIs for rendering, environment, capability, and preference signals. A blocked or missing API is itself recorded as coverage context.',
            },
            {
              icon: Fingerprint,
              title: '2. Normalize',
              body: 'The browser normalizes and hashes selected values into a compact diagnostic ID. Small environment changes can alter that snapshot, so the ID is not treated as permanent identity.',
            },
            {
              icon: ScanSearch,
              title: '3. Explain',
              body: 'The report keeps individual evidence visible. Coverage measures completed collectors; population rarity appears only when anonymous sample counts clear the configured privacy threshold.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="space-y-4 rounded-xl border p-6">
              <Icon className="text-primary h-6 w-6" aria-hidden="true" />
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-muted-foreground text-sm leading-6">{body}</p>
            </article>
          ))}
        </section>

        <section
          id="privacy"
          className="section-anchor bg-slate-950 rounded-2xl p-7 text-slate-100 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-4">
              <LockKeyhole
                className="h-7 w-7 text-blue-300"
                aria-hidden="true"
              />
              <h2 className="text-3xl font-bold tracking-tight">
                Privacy, stated precisely
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p>
                The full fingerprint is collected and its diagnostic ID is
                computed in your browser. CreepJS does not upload the raw
                canvas image or the complete collector result from this page.
                Local history stays in this browser.
              </p>
              <p>
                The optional uniqueness baseline sends a bounded comparison
                subset—Canvas hash, WebGL renderer, timezone, font count, and
                screen tuple—to the CreepJS API. The service stores coarse,
                hashed aggregate buckets and suppresses population estimates
                below the k-anonymity threshold. This boundary is why the
                report distinguishes live evidence, coverage, and rarity.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="section-anchor grid gap-8 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-primary text-sm font-semibold">Common questions</p>
            <h2 className="text-3xl font-bold tracking-tight">
              Fingerprinting without the mythology
            </h2>
          </div>
          <Accordion type="multiple" className="lg:col-span-2">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  forceMount
                  className="text-muted-foreground leading-6"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
