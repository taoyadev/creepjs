import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata, SITE_CONFIG } from '@/lib/metadata';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how CreepJS handles fingerprint data, API tokens, and analytics. Privacy-first defaults with transparent data handling.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
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
          </p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What CreepJS Does</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
              <p>
                CreepJS demonstrates how browser fingerprinting works by running
                collectors in your browser (Canvas/WebGL/Audio/Navigator/Storage
                APIs and more) and presenting the results in a human-readable
                format.
              </p>
              <p>
                The project is intended for education, security research, and
                legitimate use cases (e.g. fraud prevention). You should always
                follow applicable laws and disclose fingerprinting usage in your
                own products.
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
                computed locally to generate a fingerprint ID and to render the
                on-page report.
              </p>
              <p>
                <strong>On the API:</strong> the API is designed to be stateless
                with respect to fingerprint payloads. It validates requests and
                returns responses, and it maintains minimal operational state
                for abuse prevention.
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
                  The optional “My IP” feature may call IPInfo for IP metadata
                  and cache the response in KV for a short TTL.
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
                If enabled by the site operator, CreepJS can use Cloudflare Web
                Analytics (privacy-first, cookie-less). Analytics can be
                disabled by not setting the public analytics token.
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
  );
}
