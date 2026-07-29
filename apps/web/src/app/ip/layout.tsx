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
      <section
        id="how-ip-risk-is-scored"
        className="section-anchor bg-muted/20 border-t"
      >
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-2xl font-semibold">How CreepJS scores IP risk</h2>
          <p className="text-muted-foreground leading-7">
            CreepJS combines proxy, VPN, Tor, datacenter, network, routing, and
            evidence signals into IP-risk context. The score is not a fraud
            probability or identity verdict. Review the underlying flags and
            evidence before deciding whether to allow, monitor, challenge, or
            investigate traffic.
          </p>
        </div>
      </section>
      <SeoInternalLinks
        currentPath="/ip"
        title="Related privacy and fingerprinting tools"
        description="Connect IP reputation analysis with browser fingerprint checks, signal explainers, and API integration references."
      />
    </>
  );
}
