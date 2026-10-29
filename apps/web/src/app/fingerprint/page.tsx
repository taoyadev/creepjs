import type { Metadata } from 'next';
import { SignalLibrary } from '@/components/SignalLibrary';
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

export default function FingerprintIndexPage() {
  const hubRoute = STATIC_SEO_ROUTES.find(
    (route) => route.path === '/fingerprint'
  );

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

      <div className="container mx-auto max-w-6xl space-y-5 px-4 py-7 md:px-8 md:py-10">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Browser Fingerprint Signals
          </h1>
          <p className="text-muted-foreground leading-7">
            Find one of {FINGERPRINT_TECHNIQUES.length} signal checks. Inspect
            this browser’s values, compare a setting change, and understand what
            each result can and cannot tell you.
          </p>
        </header>
        <SignalLibrary techniques={FINGERPRINT_TECHNIQUES} />
      </div>
    </>
  );
}
