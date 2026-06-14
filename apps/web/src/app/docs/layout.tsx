import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';

export const metadata: Metadata = generateMetadata({
  title: 'Documentation - API & Integration Guide',
  description:
    'Complete CreepJS documentation for developers. Learn how to integrate browser fingerprinting into your application with our RESTful API, JavaScript SDK, and comprehensive guides.',
  path: '/docs',
});

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webPage({
            name: 'CreepJS Documentation',
            description:
              'Developer documentation for the CreepJS API, SDK, browser collectors, and privacy-first integration patterns.',
            path: '/docs',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Documentation', url: `${SITE_CONFIG.url}/docs` },
          ]),
        ]}
      />
      {children}
      <SeoInternalLinks
        currentPath="/docs"
        title="Documentation paths and live tools"
        description="Move from the API reference to live tools, individual fingerprint signals, and the browser fingerprinting guide."
      />
    </>
  );
}
