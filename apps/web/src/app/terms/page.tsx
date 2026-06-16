import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/StructuredData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Use',
  description:
    'Review the CreepJS terms of use, responsible-use boundaries, privacy expectations, and contact information.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webPage({
            name: 'Terms of Use',
            description:
              'Responsible use, privacy boundaries, and legal expectations for CreepJS.',
            path: '/terms',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Terms of Use', url: `${SITE_CONFIG.url}/terms` },
          ]),
        ]}
      />
      <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
          <header className="mb-10 space-y-3">
            <h1 className="text-4xl font-bold md:text-5xl">Terms of Use</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              These terms govern access to the CreepJS website, API, SDK, and
              educational tooling.
            </p>
          </header>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Responsible Use</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  CreepJS is intended for legitimate security, fraud prevention,
                  engineering, research, and educational use cases.
                </p>
                <p>You may not use this project to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>track users without appropriate disclosure or consent</li>
                  <li>
                    harass, discriminate against, or profile protected groups
                  </li>
                  <li>sell, broker, or republish fingerprint-derived data</li>
                  <li>
                    bypass browser privacy protections for abusive purposes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy and Compliance</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  You are responsible for complying with applicable laws and
                  regulations, including GDPR, CCPA, and sector-specific privacy
                  or surveillance rules, when embedding or calling CreepJS in
                  your own systems.
                </p>
                <p>
                  Review the{' '}
                  <Link href="/privacy" className="underline">
                    privacy policy
                  </Link>{' '}
                  for the current project data-handling rules.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Warranty</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  CreepJS is provided on an &quot;as is&quot; basis, without
                  warranties of availability, merchantability, fitness for a
                  particular purpose, or legal sufficiency for your use case.
                </p>
                <p>
                  You are responsible for validating accuracy, performance, and
                  compliance before using fingerprint-derived decisions in
                  production systems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  Questions about responsible use, privacy, or abuse reports:
                </p>
                <p>
                  <a className="underline" href="mailto:hello@creepjs.org">
                    hello@creepjs.org
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
