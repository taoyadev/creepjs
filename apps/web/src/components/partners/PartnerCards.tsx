import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { PartnerTracking } from './PartnerTracking';
import {
  providersForPlacement,
  type ActiveProxyProvider,
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

/** Primary action plus the adjacent sponsorship label the spec requires. */
function OutboundAction({
  provider,
  placement,
}: {
  provider: ActiveProxyProvider;
  placement: PartnerPlacement;
}) {
  // IP results stay visually below the lookup itself, so no filled button there.
  const variant = placement === 'partner-ip-result' ? 'secondary' : 'default';
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <a
        href={provider.outboundUrls[placement]}
        data-partner-outbound="true"
        rel="sponsored noopener noreferrer"
        referrerPolicy="no-referrer"
        className={buttonVariants({
          variant,
          className: 'w-full gap-1 font-semibold sm:w-auto',
        })}
      >
        View plans<span className="sr-only"> at {provider.name}</span>
        <span aria-hidden="true">→</span>
      </a>
      <span className="text-muted-foreground text-xs">
        Sponsored · we may earn a commission
      </span>
    </div>
  );
}

function CardTop({
  provider,
  rank,
}: {
  provider: ActiveProxyProvider;
  rank?: number;
}) {
  return (
    <CardHeader className="space-y-2">
      <CardTitle as="h3" className="flex items-baseline gap-2">
        {rank !== undefined && (
          <span className="text-muted-foreground text-base tabular-nums">
            {rank}.
          </span>
        )}
        {provider.name}
      </CardTitle>
      <p className="text-muted-foreground text-sm">
        {provider.productTypes.join(' · ')}
      </p>
      <p className="pt-1 text-lg font-semibold">
        {provider.priceFrom}
        <span className="text-muted-foreground ml-2 text-xs font-normal">
          checked{' '}
          <time dateTime={provider.verifiedAt}>{provider.verifiedAt}</time>
        </span>
      </p>
      <p className="text-sm leading-6">
        <span className="font-semibold">Best for: </span>
        {provider.bestFor.join('; ')}
      </p>
    </CardHeader>
  );
}

function CompactCard({
  provider,
  placement,
}: {
  provider: ActiveProxyProvider;
  placement: PartnerPlacement;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col [overflow-wrap:anywhere]">
      <CardTop provider={provider} />
      <CardContent className="mt-auto space-y-3 text-sm leading-6">
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">Billing: </span>
          {provider.billing}
        </p>
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">Limitation: </span>
          {provider.limitations[0]}
        </p>
        <OutboundAction provider={provider} placement={placement} />
        <Link
          href={`/proxy-providers#${provider.id}`}
          className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
        >
          Compare providers
        </Link>
      </CardContent>
    </Card>
  );
}

function DirectoryCard({
  provider,
  rank,
}: {
  provider: ActiveProxyProvider;
  rank: number;
}) {
  return (
    <Card
      id={provider.id}
      className="section-anchor flex h-full min-w-0 flex-col [overflow-wrap:anywhere]"
    >
      <CardTop provider={provider} rank={rank} />
      <CardContent className="flex flex-1 flex-col gap-4 text-sm leading-6">
        <OutboundAction provider={provider} placement="partner-directory" />
        <div>
          <p className="font-semibold">Limitations</p>
          <ul className="text-muted-foreground list-disc pl-5">
            {provider.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {[
            ['Billing unit', provider.billing],
            ['Minimum purchase', provider.minimumPurchase],
            ['Regions', provider.regions],
            ['Protocols', provider.protocols],
            ['Sessions', provider.sessionPolicy],
            ['Support', provider.support],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-semibold">{label}</dt>
              <dd className="text-muted-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-muted-foreground mt-auto text-xs leading-5">
          Sources:{' '}
          {[
            { title: 'Official website', url: provider.websiteUrl },
            ...provider.sources,
          ].map((source, index) => (
            <span key={source.url}>
              {index > 0 && ' · '}
              <a
                href={source.url}
                rel="sponsored noopener noreferrer"
                referrerPolicy="no-referrer"
                className="text-primary underline underline-offset-4"
              >
                {source.title}
              </a>
            </span>
          ))}
          . Confirm current terms with the provider.
        </p>
      </CardContent>
    </Card>
  );
}

export function PartnerCards({ placement }: { placement: PartnerPlacement }) {
  const providers = providersForPlacement(placement);
  if (!providers.length) return null;
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {providers.map((provider, index) => (
        <PartnerTracking
          key={provider.id}
          providerId={provider.id}
          placement={placement}
        >
          {placement === 'partner-directory' ? (
            <DirectoryCard provider={provider} rank={index + 1} />
          ) : (
            <CompactCard provider={provider} placement={placement} />
          )}
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
          Need a different IP address or location?
        </h2>
        <p className="text-muted-foreground text-sm">
          A proxy sends your traffic through another IP address, so sites see
          that address and its location. It does not change your browser
          fingerprint.
        </p>
        <PartnerDisclosure />
      </div>
      <PartnerCards placement="partner-ip-result" />
    </section>
  );
}
