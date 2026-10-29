import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/StructuredData';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how CreepJS handles fingerprint data, API tokens, and analytics. Privacy-first defaults with transparent data handling.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webPage({
            name: 'Privacy Policy',
            description:
              'Learn how CreepJS handles fingerprint data, API tokens, analytics, and privacy-first data minimization.',
            path: '/privacy',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Privacy Policy', url: `${SITE_CONFIG.url}/privacy` },
          ]),
        ]}
      />
      <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
        <div className="container mx-auto max-w-4xl px-4 py-7 md:py-10">
          <header className="mb-10 space-y-3">
            <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              CreepJS is an educational, privacy-first fingerprinting platform.
              This page explains what data is processed, what is stored, and how
              you can opt out.
            </p>
            <p className="text-muted-foreground text-sm">
              Site: {SITE_CONFIG.url} • Contact:{' '}
              <a className="underline" href="mailto:hello@creepjs.org">
                hello@creepjs.org
              </a>
              {' • '}
              <Link href="/terms" className="underline">
                Terms
              </Link>
            </p>
          </header>

          <nav
            aria-label="Privacy policy sections"
            className="mb-6 flex flex-wrap gap-2"
          >
            <a
              href="#purpose"
              className="hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm"
            >
              What this site does
            </a>
            <a
              href="#data"
              className="hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm"
            >
              Data & retention
            </a>
            <a
              href="#analytics"
              className="hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm"
            >
              Analytics
            </a>
            <a
              href="#choices"
              className="hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm"
            >
              Your choices
            </a>
          </nav>
          <div className="space-y-6">
            <Card id="purpose" className="section-anchor">
              <CardHeader>
                <CardTitle as="h2">What CreepJS Does</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  CreepJS demonstrates how browser fingerprinting works by
                  running collectors in your browser
                  (Canvas/WebGL/Audio/Navigator/Storage APIs and more) and
                  presenting the results in a human-readable format.
                </p>
                <p>
                  The project is intended for education, security research, and
                  legitimate use cases (e.g. fraud prevention). You should
                  always follow applicable laws and disclose fingerprinting
                  usage in your own products.
                </p>
                <p>
                  The{' '}
                  <Link href="/terms" className="underline">
                    Terms of Use
                  </Link>{' '}
                  define the project&apos;s responsible-use boundaries.
                </p>
              </CardContent>
            </Card>

            <Card id="data" className="section-anchor">
              <CardHeader>
                <CardTitle as="h2">Data Collected & Stored</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  <strong>In the browser:</strong> fingerprint components are
                  computed locally to generate a fingerprint ID and to render
                  the on-page report. A scan runs when you start it (the checker
                  starts one on load); its WebRTC check contacts Google&apos;s
                  public STUN servers (stun.l.google.com), which see your IP
                  address the same way any website does.
                </p>
                <p>
                  <strong>Checker history:</strong> the checker keeps your last
                  50 scans in this browser&apos;s localStorage so you can
                  compare them. They never leave your device, WebRTC addresses
                  and media device labels are removed before saving, and
                  &ldquo;Clear All&rdquo; deletes them.
                </p>
                <p>
                  <strong>On the API:</strong> the API is designed to be
                  stateless with respect to fingerprint payloads. It validates
                  requests and returns responses, and it maintains minimal
                  operational state for abuse prevention.
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    API tokens are stored in Cloudflare KV with the email
                    address they were requested for and their creation time.
                  </li>
                  <li>
                    Daily usage counters (per token owner, per visitor, and for
                    token requests) are kept in a Cloudflare Durable Object
                    under SHA-256 hashes of the email address or visitor IP
                    address, never the raw value, and reset after 24 hours.
                  </li>
                  <li>
                    IP lookups (the public IP checker, the token API, and the
                    optional “My IP” risk check) cache the provider&apos;s
                    response in KV under the looked-up IP address for up to 24
                    hours (1 hour for high-risk results).
                  </li>
                </ul>
                <p>
                  <strong>Optional population comparison:</strong> the checker
                  sends a Canvas hash, WebGL renderer, timezone, font count, and
                  screen tuple only when you activate “Compare with population.”
                  Small matching groups remain suppressed. This is separate from
                  submitting a full report in the API playground.
                </p>
                <p>
                  CreepJS does not intentionally store raw fingerprint component
                  payloads long-term.
                </p>
              </CardContent>
            </Card>

            <Card id="analytics" className="section-anchor">
              <CardHeader>
                <CardTitle as="h2">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  When enabled, Cloudflare Web Analytics provides aggregate
                  page-view metrics without analytics cookies. Cloudflare
                  hosting security can separately set a{' '}
                  <code>cf_clearance</code> cookie for automated-traffic checks.
                </p>
                <p>
                  Product events are sent to our own API. Event storage is
                  currently disabled for this deployment, so valid event
                  payloads are discarded. When event storage is enabled,
                  Cloudflare Workers Analytics Engine retains aggregate events
                  for up to three months. Events describe tool runs (checker
                  scans, IP risk lookups, playground API requests), API token
                  requests, docs section views, fingerprint-ID copies, and
                  clicks on a few tracked buttons and links.
                </p>
                <p>The event format permits only:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>the event name;</li>
                  <li>
                    the page path, without query string or fragment (so an IP
                    you looked up via <code>?q=</code> is never stored);
                  </li>
                  <li>
                    a few fixed labels: which tool and page section, success or
                    error, and the HTTP status code of the tool&apos;s API call.
                  </li>
                </ul>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    No IP address, user agent, cookie, email address, API token,
                    fingerprint ID or fingerprint data is stored with an event.
                  </li>
                  <li>
                    Events cannot be linked to each other or to a visitor: there
                    is no visitor or session identifier.
                  </li>
                  <li>
                    Nothing is sent when Do Not Track or Global Privacy Control
                    is enabled in your browser.
                  </li>
                </ul>
                <p>
                  If your jurisdiction requires consent for analytics or
                  fingerprinting, you must add that consent layer in your own
                  deployment before enabling those features.
                </p>
              </CardContent>
            </Card>

            <Card id="choices" className="section-anchor">
              <CardHeader>
                <CardTitle as="h2">Your Choices</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  The homepage and fingerprinting guide wait for you to start a
                  full scan; the checker starts on load. Individual signal
                  checks run automatically unless they need the external WebRTC
                  network check. You can read documentation and policies without
                  starting a full scan.
                </p>
                <p>
                  To remove stored checker scans, open{' '}
                  <Link href="/checker#history" className="underline">
                    local scan history
                  </Link>{' '}
                  and choose “Clear All.” The playground keeps tokens only in
                  this tab’s memory; reload it to clear a token. Copying or
                  sharing an IP report link shares the queried address.
                </p>
                <p>
                  Signals like Do Not Track and Global Privacy Control are part
                  of the privacy posture, but they do not replace your own
                  product-level compliance review.
                </p>
                <p>
                  For background and technical details, see the{' '}
                  <Link href="/docs" className="underline">
                    documentation
                  </Link>{' '}
                  and the{' '}
                  <Link
                    href="/guide/what-is-browser-fingerprinting"
                    className="underline"
                  >
                    browser fingerprinting guide
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
