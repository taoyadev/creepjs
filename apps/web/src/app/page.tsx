import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = generateMetadata({
  description:
    'Educational, privacy-first browser fingerprinting platform. Test your digital privacy, detect tracking methods, and understand what websites see about your device.',
  path: '',
});

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webPage({
            name: 'CreepJS Browser Fingerprinting Platform',
            description:
              'Run browser fingerprint checks, inspect IP risk, and learn how fingerprinting signals work.',
            path: '/',
          }),
          structuredData.breadcrumb([{ name: 'Home', url: SITE_CONFIG.url }]),
        ]}
      />
      <HomePageClient />
      <SeoInternalLinks
        currentPath="/"
        title="CreepJS tools and references"
        description="Start with the live checker, then inspect individual browser fingerprint signals, API docs, and IP risk analysis pages."
      />
    </>
  );
}
