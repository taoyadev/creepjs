import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/StructuredData';
import { LiveFingerprintTeaser } from '@/components/home/LiveFingerprintTeaser';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';

const CANONICAL_PATH = '/guide/what-is-browser-fingerprinting';
export const metadata: Metadata = generateMetadata({
  title: 'What Is Browser Fingerprinting?',
  description:
    'Inspect a real browser fingerprint, compare one setting change, and understand what the returned signals can and cannot establish.',
  path: CANONICAL_PATH,
});

export default function BrowserFingerprintingGuide() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.techArticle({
            headline: 'What Is Browser Fingerprinting?',
            description:
              'Browser signals, diagnostic IDs, privacy limits, and setting comparisons.',
            path: CANONICAL_PATH,
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            {
              name: 'What Is Browser Fingerprinting?',
              url: SITE_CONFIG.url + CANONICAL_PATH,
            },
          ]),
        ]}
      />
      <div className="container mx-auto max-w-6xl space-y-7 px-4 py-7 md:px-8 md:py-10">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            What is browser fingerprinting?
          </h1>
          <p className="text-muted-foreground leading-7">
            A fingerprint combines values your browser exposes—such as
            rendering, screen, language, and API support—into a diagnostic
            snapshot. Try a scan, then inspect what changed.
          </p>
        </header>
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
          <LiveFingerprintTeaser />
          <section
            id="definition"
            className="section-anchor space-y-4 rounded-xl border p-5"
          >
            <h2 className="text-xl font-bold">Read your first result</h2>
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-7">
              <li>
                <strong>Run the scan.</strong> It returns a diagnostic ID,
                collector coverage, and timing. The raw report is not uploaded
                from this page.
              </li>
              <li>
                <strong>Inspect individual values.</strong> Open the full
                checker for rendering, device hints, language, storage, and API
                support.
              </li>
              <li>
                <strong>Change one setting and rerun.</strong> Compare local
                scans to identify which observed fields changed.
              </li>
            </ol>
            <p className="text-muted-foreground text-sm leading-6">
              Clearing cookies removes stored identifiers. It does not
              necessarily change rendering or other values a site can read. A
              fingerprint can also change without clearing any storage.
            </p>
          </section>
        </div>
        <section
          id="techniques"
          className="section-anchor space-y-4 border-t pt-6"
        >
          <h2 className="text-xl font-bold">
            Choose a question to investigate
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                '/fingerprint/canvas',
                'Did rendering change?',
                'Keep a Canvas result, change one graphics or privacy setting, then rerun in that tab.',
              ],
              [
                '/checker?tab=security',
                'What does a privacy setting expose?',
                'Inspect named resistance and consistency flags, then compare a second scan.',
              ],
              [
                '/fingerprint/reduced-motion',
                'Does my preference reach the browser?',
                'Change a system motion preference and verify the value returned by the browser.',
              ],
            ].map(([href, title, detail]) => (
              <Link
                key={href}
                href={href}
                className="hover:bg-muted/40 space-y-2 rounded-lg border p-4"
              >
                <h3 className="text-primary text-sm font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-6">
                  {detail}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section
          id="accuracy"
          className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        >
          <h2 className="text-xl font-bold">
            What a fingerprint cannot establish
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              [
                'Coverage is not uniqueness',
                'Coverage counts returned collectors. A complete scan can resemble many other browsers; an incomplete scan is not a privacy score.',
              ],
              [
                'A matching ID is not a person',
                'Shared configurations can produce similar observations. A browser update, display change, or different API availability can change the snapshot.',
              ],
              [
                'Heuristics are not proof',
                'Resistance flags and consistency checks are clues. Browser differences, accessibility settings, and privacy tools can all affect them.',
              ],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="font-semibold">{term}</dt>
                <dd className="text-muted-foreground mt-1 leading-7">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          id="protection"
          className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        >
          <h2 className="text-xl font-bold">Compare a protection setting</h2>
          <p className="text-muted-foreground text-sm leading-7">
            Use the same browser and change one setting at a time. Start with a
            default scan, change the relevant built-in setting, then rescan and
            compare fields. More returned values or a different ID alone do not
            tell you whether tracking became easier.
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            A VPN changes network routing, while browser signals such as fonts
            and rendering may stay the same. Use the{' '}
            <Link
              href="/ip"
              className="text-primary underline underline-offset-4"
            >
              IP tool
            </Link>{' '}
            for network context and the{' '}
            <Link
              href="/checker"
              className="text-primary underline underline-offset-4"
            >
              browser checker
            </Link>{' '}
            for local values. Keep privacy protections enabled when a check is
            unavailable.
          </p>
        </section>
        <section
          id="privacy"
          className="section-anchor max-w-3xl space-y-3 border-t pt-6"
        >
          <h2 className="text-xl font-bold">What leaves this browser</h2>
          <p className="text-muted-foreground text-sm leading-7">
            A full scan includes a WebRTC request to Google STUN servers, which
            can observe your IP. The local collector report stays in this
            browser unless you explicitly use an API submission or comparison
            feature. The full checker saves sanitized local history that you can
            clear.
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            Population comparison is optional and sends only its disclosed
            comparison subset. IP lookups send the queried address to the API
            and its provider.{' '}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4"
            >
              Review data handling and your choices
            </Link>
            .
          </p>
        </section>
        <section
          id="faq"
          className="section-anchor max-w-3xl space-y-3 border-t py-6"
        >
          <h2 className="text-xl font-bold">
            When a result is missing or keeps changing
          </h2>
          <p className="text-muted-foreground text-sm leading-7">
            Inspect the unavailable collector rather than guessing a value.
            Retry only that signal, keep the same display and settings for a
            comparison, and check the timing and status. A blocked API can be an
            expected outcome. It does not require disabling a protection or
            granting media permissions.
          </p>
          <Link
            href="/fingerprint"
            className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            Find a signal’s method and limits
          </Link>
        </section>
      </div>
    </>
  );
}
