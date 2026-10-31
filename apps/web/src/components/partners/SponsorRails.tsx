import { AdvertiseSlot } from './AdvertiseSlot';
import { PartnerTracking, RouteTrackingProvider } from './PartnerTracking';
import {
  ADVERTISE_SPOTS,
  providersForPlacement,
  type ActiveProxyProvider,
} from '@/lib/proxy-providers';

type Slot = ActiveProxyProvider | 'advertise';

/**
 * Providers in operator order, then the advertise slot, split so the rails
 * stay symmetric: 7 providers fill 4 + 4; with fewer, the left rail holds at
 * most one more slot than the right.
 */
export function sponsorRailSlots(
  providers: readonly ActiveProxyProvider[] = providersForPlacement(
    'partner-sidebar'
  )
): { left: Slot[]; right: Slot[] } {
  const slots: Slot[] = [...providers, 'advertise'];
  const split = Math.ceil(slots.length / 2);
  return { left: slots.slice(0, split), right: slots.slice(split) };
}

function SponsorSlot({ provider }: { provider: ActiveProxyProvider }) {
  // Rails are narrow: drop "(formerly …)" style suffixes.
  const name = provider.name.replace(/\s*\(.*\)\s*$/, '');
  return (
    <PartnerTracking providerId={provider.id} placement="partner-sidebar">
      <a
        href={provider.outboundUrls['partner-sidebar']}
        data-partner-outbound="true"
        rel="sponsored noopener noreferrer"
        referrerPolicy="no-referrer"
        className="bg-muted/70 hover:bg-muted border-border/60 hover:border-primary/60 focus-visible:ring-ring group flex min-h-[5.25rem] flex-col justify-center gap-1.5 rounded-xl border p-3 shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 motion-reduce:hover:translate-y-0"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {provider.iconPath ? (
            // Plain img: static export, tiny self-hosted icons, no optimizer.
            <img
              src={provider.iconPath}
              alt=""
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain ring-1 ring-black/5"
            />
          ) : (
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold"
            >
              {name.charAt(0)}
            </span>
          )}
          <span className="group-hover:text-primary min-w-0 text-[15px] font-semibold leading-tight transition-colors [overflow-wrap:anywhere]">
            {name}
          </span>
        </span>
        <span className="text-muted-foreground text-xs leading-snug">
          {provider.tagline}
        </span>
        <span className="sr-only">(sponsored)</span>
      </a>
    </PartnerTracking>
  );
}

/**
 * Desktop-only sponsor column. Rendered after <main> in the DOM so keyboard
 * and screen-reader users reach page content first; CSS order places it.
 */
export function SponsorRail({ side }: { side: 'left' | 'right' }) {
  const { left, right } = sponsorRailSlots();
  const slots = side === 'left' ? left : right;
  if (!slots.length) return null;
  return (
    <aside
      aria-label={side === 'left' ? 'Sponsors' : 'More sponsors'}
      data-sponsor-rail={side}
      className={`hidden w-44 shrink-0 min-[1440px]:block ${
        side === 'left' ? 'order-first' : 'order-last'
      }`}
    >
      <div className="sticky top-20 space-y-2 py-6">
        <p className="text-muted-foreground px-1 text-[11px] font-medium uppercase tracking-wider">
          Sponsored
        </p>
        <RouteTrackingProvider>
          {slots.map((slot) =>
            slot === 'advertise' ? (
              <AdvertiseSlot
                key="advertise"
                openSpots={ADVERTISE_SPOTS.open}
                totalSpots={ADVERTISE_SPOTS.total}
              />
            ) : (
              <SponsorSlot key={slot.id} provider={slot} />
            )
          )}
        </RouteTrackingProvider>
      </div>
    </aside>
  );
}
