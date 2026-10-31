import { ANALYTICS_SLUG_PATTERN } from '@creepjs/core/analytics-events';

export const PARTNER_PLACEMENTS = [
  'partner-ip-result',
  'partner-directory',
  'partner-guide',
  'partner-sidebar',
] as const;
export type PartnerPlacement = (typeof PARTNER_PLACEMENTS)[number];

export interface ActiveProxyProvider {
  id: string;
  status: 'active';
  name: string;
  order: number;
  websiteUrl: string;
  /** Exact hosts reviewed by the operator, including affiliate intermediaries. */
  approvedHosts: readonly string[];
  productTypes: readonly string[];
  regions: string;
  protocols: string;
  sessionPolicy: string;
  /** Short residential entry price shown as the card headline. */
  priceFrom: string;
  /** One-line differentiator for the narrow sidebar slot (≤ 40 chars). */
  tagline: string;
  /** Self-hosted official favicon under /partners/; never hotlinked. */
  iconPath?: string;
  billing: string;
  minimumPurchase: string;
  support: string;
  bestFor: readonly string[];
  limitations: readonly string[];
  sources: ReadonlyArray<{ title: string; url: string }>;
  verifiedAt: string;
  outboundUrls: Partial<Record<PartnerPlacement, string>> & {
    'partner-directory': string;
  };
}

/** Keep a tombstone when a partnership ends; never reuse its ID. */
export type ProxyProvider =
  | ActiveProxyProvider
  | { id: string; status: 'paused' };

/**
 * Public, reviewed data only. Facts come from each provider's official pages
 * on `verifiedAt`; pool sizes and location counts are vendor-advertised.
 * Order is set by the operator (Geonix holds the agreed #3 slot).
 */
export const PROXY_PROVIDERS: readonly ProxyProvider[] = [
  {
    id: 'bright-data',
    status: 'active',
    name: 'Bright Data',
    order: 1,
    websiteUrl: 'https://brightdata.com/',
    approvedHosts: ['brightdata.com', 'get.brightdata.com'],
    productTypes: ['Residential', 'ISP', 'Datacenter', 'Mobile'],
    regions:
      '195 countries advertised for residential, with country, state, city and ZIP targeting',
    protocols: 'HTTP, HTTPS, SOCKS5 (residential)',
    sessionPolicy: 'Rotating residential IPs with configurable session control',
    priceFrom: 'Residential from $5/GB',
    tagline: 'Web data infrastructure',
    iconPath: '/partners/bright-data.png',
    billing:
      'Residential: per GB, $8/GB pay as you go at list price; monthly plans from $499',
    minimumPurchase: 'Pay as you go with no monthly commitment',
    support: '24/7 engineer support advertised',
    bestFor: [
      'Large residential pools with precise geo-targeting',
      'Teams that need several proxy types under one account',
    ],
    limitations: [
      'Pay-as-you-go list price is the highest of the providers listed here; discounts depend on current promotions',
      'Account verification (KYC) applies before residential use',
    ],
    sources: [
      {
        title: 'Residential pricing',
        url: 'https://brightdata.com/pricing/proxy-network/residential-proxies',
      },
      {
        title: 'Residential proxies FAQ',
        url: 'https://brightdata.com/proxy-types/residential-proxies',
      },
    ],
    verifiedAt: '2026-10-30',
    outboundUrls: {
      'partner-ip-result': 'https://get.brightdata.com/bw06n',
      'partner-directory': 'https://get.brightdata.com/bw06n',
      'partner-sidebar': 'https://get.brightdata.com/bw06n',
      'partner-guide': 'https://get.brightdata.com/bw06n',
    },
  },
  {
    id: 'proxy-seller',
    status: 'active',
    name: 'Proxy-Seller',
    order: 2,
    websiteUrl: 'https://proxy-seller.com/',
    approvedHosts: ['proxy-seller.com'],
    productTypes: ['Residential', 'ISP', 'IPv4', 'IPv6', 'Mobile'],
    regions:
      '220+ residential locations advertised, with city and ISP targeting',
    protocols: 'HTTP, HTTPS, SOCKS5',
    sessionPolicy:
      'Residential: rotate by time or per request, or keep a sticky session; IPv4, IPv6 and ISP IPs are static',
    priceFrom: 'Residential from $1.45/GB',
    tagline: 'Dedicated IPv4 and ISP proxies',
    iconPath: '/partners/proxy-seller.png',
    billing:
      'Residential: per GB, $3.50/GB test plan valid 30 days; static proxies per IP',
    minimumPurchase: '1 GB residential test plan ($3.50)',
    support: '24/7 human support advertised',
    bestFor: [
      'Static dedicated IPv4 or ISP addresses for long sessions',
      'Small residential tests before a larger purchase',
    ],
    limitations: [
      'Residential traffic expires 30 days after purchase',
      'Static proxy prices vary by country and rental period',
    ],
    sources: [
      {
        title: 'Residential pricing',
        url: 'https://proxy-seller.com/residential-proxies/',
      },
    ],
    verifiedAt: '2026-10-30',
    outboundUrls: {
      'partner-ip-result': 'https://proxy-seller.com/?partner=REVhIGcljl3h0',
      'partner-directory': 'https://proxy-seller.com/?partner=REVhIGcljl3h0',
      'partner-sidebar': 'https://proxy-seller.com/?partner=REVhIGcljl3h0',
      'partner-guide': 'https://proxy-seller.com/?partner=REVhIGcljl3h0',
    },
  },
  {
    id: 'geonix',
    status: 'active',
    name: 'Geonix',
    order: 3,
    websiteUrl: 'https://geonix.com/',
    approvedHosts: ['geonix.com', 'docs.geonix.com'],
    productTypes: ['Residential', 'ISP', 'IPv4', 'IPv6', 'Mobile'],
    regions:
      '210+ residential countries advertised, with state, city and ISP targeting',
    protocols: 'HTTPS, SOCKS5 (residential, auto-detected)',
    sessionPolicy:
      'Residential: new IP per request, or a session ID with an optional time limit; idle sessions end after 60 minutes',
    priceFrom: 'Residential from $0.70/GB',
    tagline: 'Budget residential from $0.70/GB',
    iconPath: '/partners/geonix.png',
    billing:
      'Residential: per GB, advertised from $0.70/GB; static proxies per IP',
    minimumPurchase:
      'Not disclosed on the reviewed pages; a trial is advertised',
    support: '24/7 live chat advertised',
    bestFor: [
      'Budget residential traffic with ISP-level targeting',
      'Static IPv4 and IPv6 proxies for long-running tasks',
    ],
    limitations: [
      'Sticky session length depends on the residential device staying online',
      'Each proxy list holds up to 1,000 IPs',
    ],
    sources: [
      { title: 'Residential proxies', url: 'https://geonix.com/resident/' },
      {
        title: 'Residential connection docs',
        url: 'https://docs.geonix.com/residential-proxies/api-tool',
      },
    ],
    verifiedAt: '2026-10-30',
    outboundUrls: {
      'partner-directory': 'https://geonix.com/?partner_link=Wv0OhZlhKm',
      'partner-sidebar': 'https://geonix.com/?partner_link=Wv0OhZlhKm',
    },
  },
  {
    id: 'iproyal',
    status: 'active',
    name: 'IPRoyal',
    order: 4,
    websiteUrl: 'https://iproyal.com/',
    approvedHosts: ['iproyal.com'],
    productTypes: ['Residential', 'ISP', 'Datacenter', 'Mobile'],
    regions:
      '195+ countries advertised, with country, state and city targeting',
    protocols: 'HTTP, HTTPS, SOCKS5',
    sessionPolicy:
      'Residential: instant IP change, auto-rotation every 1, 10 or 30 minutes, or sticky sessions up to 7 days',
    priceFrom: 'Residential from $1.75/GB',
    tagline: 'Residential traffic never expires',
    iconPath: '/partners/iproyal.svg',
    billing:
      'Residential: per GB, from $7/GB down to $1.75/GB in bulk; ISP and datacenter per IP',
    minimumPurchase: 'No monthly minimum on pay as you go',
    support: '24/7 human support advertised',
    bestFor: [
      'Occasional use: residential traffic does not expire',
      'Long sticky sessions on residential IPs',
    ],
    limitations: [
      'Small residential purchases cost much more per GB than bulk',
      'Sticky IPs last only while the residential device is online',
    ],
    sources: [
      {
        title: 'Residential proxies',
        url: 'https://iproyal.com/residential-proxies/',
      },
      {
        title: 'Residential pricing',
        url: 'https://iproyal.com/pricing/residential-proxies/',
      },
    ],
    verifiedAt: '2026-10-30',
    outboundUrls: {
      'partner-directory': 'https://iproyal.com/?r=617',
      'partner-sidebar': 'https://iproyal.com/?r=617',
    },
  },
  {
    id: 'decodo',
    status: 'active',
    name: 'Decodo (formerly Smartproxy)',
    order: 5,
    websiteUrl: 'https://decodo.com/',
    approvedHosts: ['decodo.com', 'visit.decodo.com'],
    productTypes: ['Residential', 'ISP', 'Datacenter', 'Mobile'],
    regions:
      '195+ locations advertised, with continent, country, state, city, ZIP and ASN targeting',
    protocols: 'HTTP, HTTPS, SOCKS5',
    sessionPolicy: 'Residential: rotating or sticky sessions',
    priceFrom: 'Residential from $2/GB',
    tagline: 'ZIP and ASN geo-targeting',
    iconPath: '/partners/decodo.png',
    billing:
      'Residential: per GB, $4/GB pay as you go; monthly plans from $3.75/GB (3 GB)',
    minimumPurchase: 'Pay as you go from 1 GB ($4 + VAT)',
    support: '24/7 tech support advertised',
    bestFor: [
      'Developers who want simple per-GB residential plans',
      'Fine geo-targeting down to ZIP code or ASN',
    ],
    limitations: [
      'Listed prices exclude VAT',
      'The free trial is limited to 100 MB for 3 days',
    ],
    sources: [
      {
        title: 'Residential pricing',
        url: 'https://decodo.com/proxies/residential-proxies/pricing',
      },
    ],
    verifiedAt: '2026-10-30',
    outboundUrls: {
      'partner-directory': 'https://visit.decodo.com/smartproxy',
      'partner-sidebar': 'https://visit.decodo.com/smartproxy',
      'partner-guide': 'https://visit.decodo.com/residential-proxies',
    },
  },
  {
    id: 'soax',
    status: 'active',
    name: 'SOAX',
    order: 6,
    websiteUrl: 'https://soax.com/',
    approvedHosts: ['soax.com', 'soax.sjv.io'],
    productTypes: ['Residential', 'Mobile', 'Datacenter'],
    regions:
      'Country, region, city, ISP and ASN targeting; prices vary by country tier',
    protocols: 'HTTP, HTTPS, SOCKS5',
    sessionPolicy:
      'Residential: keep the same IP across requests or rotate on every request',
    priceFrom: 'Residential from $0.85/GB',
    tagline: 'Residential + mobile, one rate',
    iconPath: '/partners/soax.svg',
    billing:
      'Residential and mobile share one per-GB rate: Tier 1 $5/GB (Sandbox, $0 plan) to $1.50/GB (Scale, $1,500/mo); $0.85/GB on Enterprise; excl. VAT',
    minimumPurchase: 'Sandbox plan has no monthly fee; usage is billed per GB',
    support: 'Not disclosed on the reviewed pages',
    bestFor: [
      'Teams that want residential and mobile IPs under one rate',
      'Targeting by city, ISP or ASN',
    ],
    limitations: [
      'Low per-GB rates need a monthly plan of $1,500 or more',
      'Tier 2 and Tier 3 countries are priced separately',
    ],
    sources: [
      { title: 'Pricing', url: 'https://soax.com/pricing' },
      {
        title: 'Residential proxies',
        url: 'https://soax.com/proxies/residential',
      },
    ],
    verifiedAt: '2026-10-31',
    outboundUrls: {
      'partner-directory': 'https://soax.sjv.io/proxy',
      'partner-sidebar': 'https://soax.sjv.io/proxy',
    },
  },
  {
    id: 'webshare',
    status: 'active',
    name: 'Webshare',
    order: 7,
    websiteUrl: 'https://www.webshare.io/',
    approvedHosts: ['www.webshare.io', 'proxy2.webshare.io'],
    productTypes: ['Datacenter', 'Static residential', 'Residential'],
    regions:
      'Datacenter: 50+ countries; residential: 195 countries with city, state, ZIP and ASN targeting',
    protocols: 'HTTP, SOCKS5',
    sessionPolicy:
      'Datacenter and static residential IPs are fixed; residential rotates',
    priceFrom: 'Residential from $1.40/GB',
    tagline: '10 free proxies to start',
    iconPath: '/partners/webshare.png',
    billing:
      'Datacenter per proxy: 10 free, 100 for $2.99/mo; residential per GB, $3.50/GB for 1 GB down to $1.40/GB at 3 TB',
    minimumPurchase: 'Free plan with 10 datacenter proxies',
    support: 'Not disclosed on the reviewed pages',
    bestFor: [
      'Trying proxies for free before paying',
      'Cheap shared datacenter proxies in bulk',
    ],
    limitations: [
      'Free proxies are datacenter IPs, not residential',
      'The lowest residential rate needs 3 TB a month',
    ],
    sources: [
      { title: 'Pricing', url: 'https://www.webshare.io/pricing' },
      {
        title: 'Residential proxies',
        url: 'https://www.webshare.io/residential-proxy',
      },
    ],
    verifiedAt: '2026-10-31',
    outboundUrls: {
      'partner-directory':
        'https://proxy2.webshare.io/register/?referral_code=xn5m7d467sbh',
      'partner-sidebar':
        'https://proxy2.webshare.io/register/?referral_code=xn5m7d467sbh',
    },
  },
];

/** Fail the build for incomplete active records rather than publishing them. */
export function validateProxyProviders(
  providers: readonly ProxyProvider[],
  today = new Date().toISOString().slice(0, 10)
): void {
  const ids = new Set<string>();
  for (const provider of providers) {
    const fail = (field: string): never => {
      // Do not include URL values: a mistaken credential must not enter logs.
      throw new Error(`Invalid proxy provider ${provider.id}: ${field}`);
    };
    if (
      typeof provider.id !== 'string' ||
      !ANALYTICS_SLUG_PATTERN.test(provider.id)
    )
      fail('id');
    if (ids.has(provider.id)) fail('duplicate id');
    ids.add(provider.id);
    if (provider.status === 'paused') continue;
    if (provider.status !== 'active') fail('status');
    const text = (value: unknown, field: string) => {
      if (typeof value !== 'string' || !value.trim()) fail(field);
    };
    for (const field of [
      'name',
      'regions',
      'protocols',
      'sessionPolicy',
      'priceFrom',
      'tagline',
      'billing',
      'minimumPurchase',
      'support',
    ] as const)
      text(provider[field], field);
    if (provider.tagline.length > 40) fail('tagline');
    if (
      provider.iconPath !== undefined &&
      !/^\/partners\/[a-z0-9-]+\.(png|svg)$/.test(provider.iconPath)
    )
      fail('iconPath');
    if (!Number.isSafeInteger(provider.order) || provider.order < 0)
      fail('order');
    const date = provider.verifiedAt;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date ||
      date > today
    )
      fail('verifiedAt');
    for (const field of [
      'productTypes',
      'bestFor',
      'limitations',
      'approvedHosts',
    ] as const) {
      if (!Array.isArray(provider[field]) || !provider[field].length)
        fail(field);
      for (const value of provider[field]) text(value, field);
    }
    const url = (value: string, field: string) => {
      try {
        const parsed = new URL(value);
        if (
          value !== value.trim() ||
          parsed.protocol !== 'https:' ||
          parsed.username ||
          parsed.password ||
          !provider.approvedHosts.includes(parsed.host)
        )
          fail(field);
      } catch {
        fail(field);
      }
    };
    url(provider.websiteUrl, 'websiteUrl');
    if (!Array.isArray(provider.sources) || !provider.sources.length)
      fail('sources');
    for (const source of provider.sources) {
      text(source.title, 'source title');
      url(source.url, 'source URL');
    }
    if (!provider.outboundUrls?.['partner-directory']) fail('directory URL');
    for (const [placement, value] of Object.entries(provider.outboundUrls)) {
      if (!PARTNER_PLACEMENTS.includes(placement as PartnerPlacement))
        fail('placement');
      url(value, `outboundUrls.${placement}`);
    }
  }
}

validateProxyProviders(PROXY_PROVIDERS);
export const ACTIVE_PROXY_PROVIDERS = PROXY_PROVIDERS.filter(
  (provider): provider is ActiveProxyProvider => provider.status === 'active'
).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
/** Sidebar slots across both desktop rails, including the advertise slot. */
export const SPONSOR_SLOT_COUNT = 8;
/** Operator-set availability shown in the advertise dialog. */
export const ADVERTISE_SPOTS = { open: 3, total: 10 } as const;

export const HAS_PROXY_PROVIDERS = ACTIVE_PROXY_PROVIDERS.length > 0;
/**
 * Operator decision 2026-10-31: sponsors appear in the sidebar rails; the
 * directory stays reachable but unlisted (no navigation, noindex, no sitemap).
 */
export const DIRECTORY_LISTED: boolean = false;

export function providersForPlacement(
  placement: PartnerPlacement,
  providers: readonly ActiveProxyProvider[] = ACTIVE_PROXY_PROVIDERS
): readonly ActiveProxyProvider[] {
  const selected = providers.filter(
    (provider) => provider.outboundUrls[placement]
  );
  if (placement === 'partner-ip-result') return selected.slice(0, 2);
  // One sidebar slot always stays open for the advertise call-to-action.
  if (placement === 'partner-sidebar')
    return selected.slice(0, SPONSOR_SLOT_COUNT - 1);
  return selected;
}
