import Link from 'next/link';
import { collectorManifest, type CollectorManifestEntry } from '@creepjs/core';
import { CheckerApp } from '@/components/checker/CheckerApp';
import { CheckerSectionNav } from '@/components/checker/CheckerSectionNav';

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
    description:
      'Contrast, reduced motion, forced colors, and related settings.',
  },
  {
    key: 'privacy',
    label: 'Privacy resistance',
    description:
      'Anti-fingerprinting signals, blockers, and consistency checks.',
  },
  {
    key: 'network',
    label: 'Network surface',
    description: 'WebRTC, service workers, and network-exposed capabilities.',
  },
];

export default function CheckerPage() {
  return (
    <div className="bg-background">
      <header className="container mx-auto max-w-7xl space-y-2 px-4 py-6 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Browser Fingerprint Checker
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">
          Your scan starts automatically. Inspect returned values, missing APIs,
          and privacy signals. Change one setting and rescan to compare the
          effect.
        </p>
        <p className="text-muted-foreground max-w-3xl text-xs leading-5">
          Runs in your browser. The WebRTC check contacts Google STUN servers.
          Sanitized scan history stays on this device; population comparison is
          optional.{' '}
          <a
            href="#privacy"
            className="text-primary underline underline-offset-4"
          >
            Data handling
          </a>
        </p>
      </header>
      <CheckerSectionNav />
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-8 [&_.section-anchor]:scroll-mt-32">
        <section
          id="scan"
          className="section-anchor"
          aria-label="Live browser report"
        >
          <CheckerApp />
        </section>
        <section
          id="what-does-the-checker-report"
          className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        >
          <h2 className="text-xl font-bold">What does the checker report?</h2>
          <p className="text-muted-foreground text-sm leading-7">
            The ID summarizes this scan, not a person. Coverage counts
            collectors that returned data; unsupported and failed checks remain
            visible. Low coverage can reflect browser support or privacy
            settings. It does not establish a more private or less trustworthy
            browser.
          </p>
        </section>
        <section id="signals" className="section-anchor space-y-4">
          <h2 className="text-xl font-bold">What is checked</h2>
          <p className="text-muted-foreground text-sm">
            {collectorManifest.length} checks across {CATEGORY_META.length}{' '}
            categories. Use the signal library below to test one check on its
            own.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_META.map((category) => (
              <div key={category.key} className="space-y-1">
                <dt className="text-sm font-semibold">{category.label}</dt>
                <dd className="text-muted-foreground text-sm leading-6">
                  {category.description}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/fingerprint"
            className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            Browse the signal library
          </Link>
        </section>
        <section
          id="how-it-works"
          className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        >
          <h2 className="text-xl font-bold">Method &amp; limits</h2>
          <p className="text-muted-foreground text-sm leading-7">
            Collectors read browser APIs, normalize values, and compute a
            diagnostic ID. Updates, fonts, displays, permissions, and settings
            can change that ID. Network checks can fail independently of local
            collection. Keep the actual fields and timing when comparing; a
            changed ID alone does not explain the cause.
          </p>
        </section>
        <section
          id="privacy"
          className="section-anchor max-w-3xl space-y-3 border-t py-6"
        >
          <h2 className="text-xl font-bold">Privacy &amp; recovery</h2>
          <p className="text-muted-foreground text-sm leading-7">
            The full raw report is not uploaded by this checker. Optional
            population comparison sends a Canvas hash, WebGL renderer, timezone,
            font count, and screen tuple to the CreepJS API. Small comparison
            buckets are suppressed. Comparison failure never prevents you from
            using your local report.
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            The last 50 sanitized scans are saved in this browser for
            comparison. Use “Clear All” in scan history to remove them. When
            storage is blocked, the current report remains usable. Clipboard and
            download controls run only when activated.{' '}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4"
            >
              Full privacy policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
