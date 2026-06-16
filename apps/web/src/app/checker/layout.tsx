import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';

export const metadata: Metadata = generateMetadata({
  title: 'Fingerprint Checker - Test Your Browser Privacy',
  description:
    'Run a full browser fingerprint scan with 40+ collectors. Inspect what websites can infer about your device, and explore privacy risks with detailed breakdowns.',
  path: '/checker',
});

export default function CheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webApplication({
            name: 'Fingerprint Checker',
            description:
              'Run a full browser fingerprint scan with collector coverage and privacy risk analysis.',
            path: '/checker',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Fingerprint Checker', url: `${SITE_CONFIG.url}/checker` },
          ]),
        ]}
      />
      {children}
      <SeoInternalLinks
        currentPath="/checker"
        title="Keep exploring browser privacy signals"
        description="After the live checker, compare individual fingerprint collectors, IP risk signals, API docs, and integration examples."
      />
    </>
  );
}
