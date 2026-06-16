import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';

export const metadata: Metadata = generateMetadata({
  title: 'API Playground - Test Fingerprinting in Real-Time',
  description:
    'Interactive CreepJS API playground. Test browser fingerprinting endpoints, experiment with different collectors, and see live API responses with syntax-highlighted JSON.',
  path: '/playground',
});

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webApplication({
            name: 'CreepJS API Playground',
            description:
              'Generate API tokens, test fingerprint requests, and inspect browser fingerprinting API responses.',
            path: '/playground',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'API Playground', url: `${SITE_CONFIG.url}/playground` },
          ]),
        ]}
      />
      {children}
      <SeoInternalLinks
        currentPath="/playground"
        title="Next steps after testing the API"
        description="Open the docs, compare collector pages, or run live browser and IP risk checks from the same static site."
      />
    </>
  );
}
