import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Database,
  ExternalLink,
  Network,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { CompactIpLookup } from '@/components/CompactIpLookup';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';
import { StructuredData } from '@/components/StructuredData';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';
import {
  IP_PROXY_PILOT_PATH,
  IP_PROXY_PILOT_ROUTE,
} from '@/lib/seo-routes';

const CANONICAL_URL = `${SITE_CONFIG.url}${IP_PROXY_PILOT_PATH}`;

export const metadata: Metadata = generateMetadata({
  title: IP_PROXY_PILOT_ROUTE.title,
  description: IP_PROXY_PILOT_ROUTE.description,
  path: IP_PROXY_PILOT_PATH,
});

const interpretationRows = [
  {
    signal: 'Proxy, VPN, or Tor',
    meaning:
      'A returned flag is direct proxy-related evidence for this classification. Check the evidence labels and confidence before acting.',
  },
  {
    signal: 'Datacenter or hosting',
    meaning:
      'Infrastructure ownership can support a proxy hypothesis, but a server address is not automatically an anonymous proxy.',
  },
  {
    signal: 'Network and routing',
    meaning:
      'ASN, owner, prefix, and RPKI context help you understand who announces the address and whether signals agree.',
  },
  {
    signal: 'Risk and evidence',
    meaning:
      'Risk bands summarize several inputs. Evidence rows are more useful than treating one score as a fraud probability.',
  },
] as const;

export default function IpProxyPilotPage() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.webPage({
            name: IP_PROXY_PILOT_ROUTE.title,
            description: IP_PROXY_PILOT_ROUTE.description,
            path: IP_PROXY_PILOT_PATH,
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'IP Risk Checker', url: `${SITE_CONFIG.url}/ip` },
            { name: 'How to Tell If an IP Is a Proxy', url: CANONICAL_URL },
          ]),
        ]}
      />

      <div>
        <section className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-10 lg:py-16">
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground mb-8 text-sm"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/ip" className="hover:text-foreground">
                    IP Risk Checker
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground" aria-current="page">
                  How to Tell If an IP Is a Proxy
                </li>
              </ol>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div className="max-w-3xl space-y-6">
                <Badge variant="outline">IP lookup guide + live tool</Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                    How to Tell If an IP Is a Proxy
                  </h1>
                  <p className="text-muted-foreground text-lg leading-8">
                    Check the address first, then read the proxy, VPN, Tor,
                    datacenter, network, risk, and evidence fields together.
                    CreepJS keeps the live result separate from interpretation
                    so conflicting signals remain visible.
                  </p>
                </div>

              </div>

              <CompactIpLookup />

              <div
                id="how-to-tell"
                className="section-anchor border-primary/20 bg-primary/5 rounded-lg border p-5 lg:col-span-2"
              >
                <h2 className="font-semibold">
                  How can you tell if an IP is a proxy?
                </h2>
                <p className="text-muted-foreground mt-2 leading-7">
                  CreepJS checks direct proxy, VPN, and Tor flags, then adds
                  datacenter ownership, routing, risk, and evidence context.
                  Several agreeing signals support a proxy classification; a
                  negative flag alone does not prove an address is residential,
                  direct, trusted, or benign.
                </p>
              </div>
            </div>
          </div>
        </section>

        <article className="container mx-auto max-w-6xl space-y-16 px-4 py-12 lg:py-16">
          <section aria-labelledby="read-result-heading">
            <div className="max-w-3xl">
              <h2
                id="read-result-heading"
                className="text-3xl font-semibold tracking-tight"
              >
                Read the result as a set of signals
              </h2>
              <p className="text-muted-foreground mt-3 leading-7">
                A useful decision keeps direct classifications, infrastructure
                context, and supporting evidence distinct. Do not turn a
                datacenter flag or a low risk score into a claim the data does
                not make.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {interpretationRows.map((row) => (
                <Card key={row.signal}>
                  <CardHeader>
                    <CardTitle className="text-lg">{row.signal}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-7">
                      {row.meaning}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="decision-heading"
            className="grid gap-8 lg:grid-cols-3"
          >
            <div>
              <ShieldCheck className="text-primary mb-4 h-7 w-7" />
              <h2 id="decision-heading" className="text-xl font-semibold">
                Start with direct flags
              </h2>
              <p className="text-muted-foreground mt-3 leading-7">
                Proxy, VPN, and Tor booleans answer the narrow classification
                question. Their absence means “not flagged by the current
                data,” not “known to be a normal household connection.”
              </p>
            </div>
            <div>
              <Network className="text-primary mb-4 h-7 w-7" />
              <h2 className="text-xl font-semibold">Check network context</h2>
              <p className="text-muted-foreground mt-3 leading-7">
                Compare the ASN, organization, usage type, datacenter status,
                announced prefix, and routing details. This context can explain
                why a direct flag exists or why the result is ambiguous.
              </p>
            </div>
            <div>
              <Database className="text-primary mb-4 h-7 w-7" />
              <h2 className="text-xl font-semibold">Inspect the evidence</h2>
              <p className="text-muted-foreground mt-3 leading-7">
                Evidence rows expose the labels, severity, and confidence
                returned for the address. Prefer those concrete inputs over a
                single score when signals disagree.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="limits-heading"
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 md:p-8"
          >
            <div className="flex items-start gap-4">
              <TriangleAlert className="mt-1 h-6 w-6 flex-none text-amber-500" />
              <div className="space-y-4">
                <h2 id="limits-heading" className="text-2xl font-semibold">
                  Classification limits
                </h2>
                <p className="text-muted-foreground leading-7">
                  IP ownership and exit behavior change. Commercial VPNs,
                  residential relays, corporate gateways, and newly reassigned
                  ranges may be missing or classified differently over time.
                  Treat the result as one input to a proportionate decision,
                  not as identity proof or a reason to block someone
                  automatically.
                </p>
                <p className="text-muted-foreground leading-7">
                  CreepJS retrieves the fields from IPbot through its own
                  privacy-filtered Worker. Standard results may be cached for
                  up to 24 hours; elevated-risk results use a shorter cache.
                  Review the{' '}
                  <a
                    href="https://ipbot.com/response-schema/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    IPbot response schema
                    <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                  </a>{' '}
                  for the upstream field definitions.
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="next-step-heading"
            className="bg-primary text-primary-foreground rounded-xl p-6 md:p-10"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 id="next-step-heading" className="text-2xl font-semibold">
                  Need the complete network report?
                </h2>
                <p className="mt-2 text-primary-foreground/80">
                  Open the full checker for geolocation, ASN, routing, risk,
                  evidence, share links, and batch tools.
                </p>
              </div>
              <Link
                href="/ip"
                className="bg-background text-foreground inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium shadow-sm transition-colors hover:bg-background/90"
              >
                Open IP Risk Checker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </div>

      <SeoInternalLinks
        currentPath={IP_PROXY_PILOT_PATH}
        title="Continue your privacy and network review"
        description="Move from proxy-oriented evidence to the full IP report, browser fingerprint checker, or implementation documentation."
      />
    </>
  );
}
