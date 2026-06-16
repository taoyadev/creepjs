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
                    API tokens (email, createdAt, usageCount) are stored in
                    Cloudflare KV.
                  </li>
                  <li>
                    Rate limit counters are stored in Cloudflare KV with a
                    time-based reset window.
                  </li>
                  <li>
                    The optional “My IP” feature uses the same server-side IPbot
                    integration as the public IP checker and caches the response
                    in KV for a short TTL.
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
                  If enabled by the site operator, CreepJS can use Cloudflare
                  Web Analytics (privacy-first, cookie-less). Analytics can be
                  disabled by not setting the public analytics token.
                </p>
                <p>
                  The current product analytics events are limited to high-level
                  product usage signals: checker runs, IP risk lookups, API
                  token requests, playground API tests, docs section views,
                  code-example copy actions, and major CTA clicks.
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>No email addresses are sent to analytics.</li>
                  <li>
                    No fingerprint IDs, raw fingerprint payloads, or IP lookup
                    response bodies are sent to analytics.
                  </li>
                  <li>
                    Page and link analytics are normalized to path-level URLs to
                    avoid leaking query parameters.
                  </li>
                  <li>
                    The analytics beacon is skipped when Do Not Track is
                    enabled.
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
