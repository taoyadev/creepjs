import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Fingerprint, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StructuredData } from '@/components/StructuredData';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';
import {
  FINGERPRINT_TECHNIQUES,
  STATIC_SEO_ROUTES,
  absoluteUrl,
} from '@/lib/seo-routes';

export const metadata: Metadata = generateMetadata({
  title: 'Browser Fingerprint Signals - Complete Collector Index',
  description:
    'Browse 50+ browser fingerprinting signals including canvas, WebGL, WebRTC, fonts, storage, hardware, accessibility, and anti-fingerprinting checks.',
  path: '/fingerprint',
});

const categories = Array.from(
  FINGERPRINT_TECHNIQUES.reduce((map, technique) => {
    const group = map.get(technique.category) ?? [];
    group.push(technique);
    map.set(technique.category, group);
    return map;
  }, new Map<string, Array<(typeof FINGERPRINT_TECHNIQUES)[number]>>())
).sort(([a], [b]) => a.localeCompare(b));

export default function FingerprintIndexPage() {
  const hubRoute = STATIC_SEO_ROUTES.find((route) => route.path === '/fingerprint');

  return (
    <>
      <StructuredData
        data={[
          structuredData.collectionPage({
            name: 'Browser Fingerprint Signals',
            description:
              hubRoute?.description ??
              'Browse the CreepJS browser fingerprinting signal library.',
            path: '/fingerprint',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Fingerprint Signals', url: absoluteUrl('/fingerprint') },
          ]),
          structuredData.itemList(
            FINGERPRINT_TECHNIQUES.map((technique) => ({
              name: technique.name,
              description: technique.description,
              url: absoluteUrl(`/fingerprint/${technique.slug}`),
            }))
          ),
        ]}
      />

      <div className="min-h-screen bg-background">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-6xl space-y-6 px-4 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Fingerprint className="h-4 w-4 text-blue-500" />
              Signal library
            </div>
            <div className="max-w-4xl space-y-4">
              <h1 className="text-3xl font-semibold md:text-5xl">
                Browser Fingerprint Signals
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                CreepJS documents each browser fingerprint collector as a
                standalone page. Use this index to compare graphics, hardware,
                browser, network, privacy, storage, accessibility, and system
                signals that can make a browser identifiable.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border bg-background p-4">
                <Shield className="mb-3 h-5 w-5 text-emerald-500" />
                <div className="font-medium">Privacy context</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Each page explains what the signal exposes and which privacy
                  tools commonly reduce or normalize it.
                </p>
              </div>
              <div className="rounded-md border bg-background p-4">
                <BookOpen className="mb-3 h-5 w-5 text-purple-500" />
                <div className="font-medium">Technical detail</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Signal pages include live collectors, API examples, use
                  cases, and readable explanations for developers.
                </p>
              </div>
              <div className="rounded-md border bg-background p-4">
                <Fingerprint className="mb-3 h-5 w-5 text-blue-500" />
                <div className="font-medium">
                  {FINGERPRINT_TECHNIQUES.length} signal pages
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  All published signal pages are linked here with stable
                  canonical URLs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl space-y-8 px-4 py-10 md:py-14">
          {categories.map(([category, techniques]) => (
            <div key={category} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{category}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {techniques.length} published signal
                  {techniques.length === 1 ? '' : 's'} in this category.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {techniques.map((technique) => (
                  <Card key={technique.slug} className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {technique.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {technique.description}
                      </p>
                      <Link
                        href={`/fingerprint/${technique.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        Open signal page
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
