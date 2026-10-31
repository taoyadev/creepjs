import Link from 'next/link';
import {
  PartnerCards,
  PartnerDisclosure,
} from '@/components/partners/PartnerCards';
import { PartnerTrackingProvider } from '@/components/partners/PartnerTracking';
import { StructuredData } from '@/components/StructuredData';
import { generateMetadata, structuredData } from '@/lib/metadata';
import { DIRECTORY_LISTED, HAS_PROXY_PROVIDERS } from '@/lib/proxy-providers';

export const metadata = generateMetadata({
  title: 'Proxy providers',
  description:
    'Compare reviewed partner proxy services by use case, session behavior, billing unit, and limitations.',
  path: '/proxy-providers',
  noIndex: !DIRECTORY_LISTED,
});

export default function ProxyProvidersPage() {
  return (
    <PartnerTrackingProvider>
      <StructuredData
        data={structuredData.collectionPage({
          name: 'Proxy providers',
          description:
            'Reviewed partner information and network-service selection guidance.',
          path: '/proxy-providers',
        })}
      />
      <div className="container mx-auto max-w-6xl space-y-7 px-4 py-7 md:px-8 md:py-10">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Proxy providers
          </h1>
          <p className="text-muted-foreground leading-7">
            Compare services for your network requirements. Start with the
            regions, session continuity, and traffic budget your task needs.
          </p>
          <PartnerDisclosure />
        </header>
        <section aria-labelledby="providers-heading" className="space-y-4">
          <h2 id="providers-heading" className="text-xl font-semibold">
            Partner information
          </h2>
          {HAS_PROXY_PROVIDERS ? (
            <PartnerCards placement="partner-directory" />
          ) : (
            <div className="space-y-3 rounded-xl border p-5">
              <p className="font-medium">
                No verified partner listings are available yet.
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                You can still use the IP checker and selection guide. Listings
                will appear after their public details and partnership links
                have been reviewed.
              </p>
            </div>
          )}
        </section>
        <section
          aria-labelledby="selection-heading"
          className="space-y-3 border-t pt-6"
        >
          <h2 id="selection-heading" className="text-xl font-semibold">
            Before choosing a service
          </h2>
          <ul className="grid gap-4 text-sm leading-6 md:grid-cols-3">
            <li>
              <strong>Session behavior.</strong> Check how long an exit address
              can remain available and what happens after a disconnect.
            </li>
            <li>
              <strong>Total cost.</strong> Compare the billing unit, minimum
              purchase, expiry, and any traffic or concurrency limits.
            </li>
            <li>
              <strong>Fit and limits.</strong> Confirm protocols, permitted
              uses, support, and refund terms with the provider.
            </li>
          </ul>
        </section>
        <section
          className="max-w-3xl space-y-3 border-t pt-6"
          aria-labelledby="review-heading"
        >
          <h2 id="review-heading" className="text-xl font-semibold">
            How information is maintained
          </h2>
          <p className="text-muted-foreground text-sm leading-7">
            The CreepJS.org operator reviews public provider information and
            sets the display order. Each listing shows its sources and review
            date. This is a dated information snapshot, not a live price feed,
            performance test, safety certification, or ranking of the whole
            market. Missing details are marked as not disclosed.
          </p>
          <p className="text-muted-foreground text-sm leading-7">
            Your IP address, risk result, and browser fingerprint do not select
            or rank these listings. Partnerships do not imply endorsement by
            Abraham Juliot or the original CreepJS research project.
          </p>
        </section>
        <nav
          aria-label="Related proxy resources"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
        >
          <Link
            className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
            href="/guide/static-vs-rotating-proxies"
          >
            Static vs rotating proxies
          </Link>
          <Link
            className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
            href="/ip"
          >
            Check an IP address
          </Link>
          <Link
            className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
            href="/ip-lookup/how-to-tell-if-an-ip-is-a-proxy"
          >
            Interpret proxy signals
          </Link>
        </nav>
      </div>
    </PartnerTrackingProvider>
  );
}
