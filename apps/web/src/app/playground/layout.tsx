import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'API Playground - Test Fingerprinting in Real-Time',
  description:
    'Interactive CreepJS API playground. Generate an in-memory token, test the browser fingerprint endpoint, and inspect formatted API responses.',
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
    </>
  );
}
