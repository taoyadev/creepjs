import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { PartnerTracking } from './PartnerTracking';
import {
  providersForPlacement,
  type PartnerPlacement,
} from '@/lib/proxy-providers';

export function PartnerDisclosure() {
  return (
    <p className="text-muted-foreground text-sm leading-6">
      Sponsored partnerships. We may earn a commission from qualifying
      purchases. Partnerships do not affect your IP check results.
    </p>
  );
}

export function PartnerCards({ placement }: { placement: PartnerPlacement }) {
  const providers = providersForPlacement(placement);
  if (!providers.length) return null;
  const directory = placement === 'partner-directory';
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {providers.map((provider) => (
        <PartnerTracking
          key={provider.id}
          providerId={provider.id}
          placement={placement}
        >
          <Card
            id={directory ? provider.id : undefined}
            className="section-anchor h-full min-w-0 [overflow-wrap:anywhere]"
          >
            <CardHeader>
              <CardTitle as="h3">{provider.name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {provider.productTypes.join(' · ')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6">
              <div>
                <p className="font-semibold">Suited to</p>
                <ul className="list-disc pl-5">
                  {provider.bestFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">Limitations</p>
                <ul className="list-disc pl-5">
                  {provider.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <dl className="space-y-2">
                {(directory
                  ? [
                      ['Regions', provider.regions],
                      ['Protocols', provider.protocols],
                      ['Sessions', provider.sessionPolicy],
                      ['Billing unit', provider.billing],
                      ['Minimum purchase', provider.minimumPurchase],
                      ['Support', provider.support],
                    ]
                  : [['Billing unit', provider.billing]]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold">{label}</dt>
                    <dd className="text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground">
                Information checked{' '}
                <time dateTime={provider.verifiedAt}>
                  {provider.verifiedAt}
                </time>
                . Confirm current terms with the provider.
              </p>
              {directory && (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { title: 'Official website', url: provider.websiteUrl },
                    ...provider.sources,
                  ].map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      rel="sponsored noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="text-primary underline underline-offset-4"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
              <PartnerDisclosure />
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={provider.outboundUrls[placement]}
                  data-partner-outbound="true"
                  rel="sponsored noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  View plans<span className="sr-only"> at {provider.name}</span>
                </a>
                {!directory && (
                  <Link
                    href={`/proxy-providers#${provider.id}`}
                    className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    Compare providers
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </PartnerTracking>
      ))}
    </div>
  );
}

export function IpPartnerRecommendations() {
  if (!providersForPlacement('partner-ip-result').length) return null;
  return (
    <section
      aria-labelledby="ip-partners-heading"
      className="space-y-4 border-t pt-6"
    >
      <div className="space-y-2">
        <h2 id="ip-partners-heading" className="text-xl font-semibold">
          Explore proxy providers
        </h2>
        <p className="text-muted-foreground text-sm">
          Compare partner services for your network requirements.
        </p>
      </div>
      <PartnerCards placement="partner-ip-result" />
    </section>
  );
}
