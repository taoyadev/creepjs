import type { Metadata } from 'next';
import { SITE_CONFIG, generateMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';

export const metadata: Metadata = generateMetadata({
  title: 'Free IP Risk Checker - Proxy, VPN, ASN & Geo Lookup',
  description:
    'Check any IP address for proxy, VPN, Tor, datacenter, ASN, geolocation, risk score, and routing signals with free public lookups and no token required.',
  path: '/ip',
});

export default function IpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webApplication({
            name: 'IP Risk Checker',
            description:
              'Check IP risk, ASN, geolocation, proxy, VPN, Tor, datacenter, and routing signals with free public lookups.',
            path: '/ip',
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'IP Risk Checker', url: `${SITE_CONFIG.url}/ip` },
          ]),
        ]}
      />
      {children}
      <SeoInternalLinks
        currentPath="/ip"
        title="Related privacy and fingerprinting tools"
        description="Connect IP reputation analysis with browser fingerprint checks, signal explainers, and API integration references."
      />
    </>
  );
}
