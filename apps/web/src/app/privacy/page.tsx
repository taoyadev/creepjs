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
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
          <header className="mb-10 space-y-3">
            <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What CreepJS Does</CardTitle>
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
                <p>
                  For reviewer-level storage traceability in the repository, see
                  the data traceability matrix in `docs/SECURITY.md`.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Collected & Stored</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  <strong>In the browser:</strong> fingerprint components are
                  computed locally to generate a fingerprint ID and to render
                  the on-page report.
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
                  CreepJS does not intentionally store raw fingerprint component
                  payloads long-term.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  Page views are counted by Cloudflare Web Analytics, which is
                  cookie-less and does not identify visitors.
                </p>
                <p>
                  Product events are sent to our own API and stored in
                  Cloudflare Workers Analytics Engine, which keeps them for
                  three months. They count tool runs (checker scans, IP risk
                  lookups, playground API requests), API token requests, docs
                  section views, fingerprint-ID copies, and clicks on a few
                  tracked buttons and links.
                </p>
                <p>Each stored event contains only:</p>
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

            <Card>
              <CardHeader>
                <CardTitle>Your Choices</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  If you do not want to be fingerprinted, you can close the site
                  or use privacy-focused browsers and settings that reduce
                  fingerprintability.
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
