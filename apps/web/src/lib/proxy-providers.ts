import { ANALYTICS_SLUG_PATTERN } from '@creepjs/core/analytics-events';

export const PARTNER_PLACEMENTS = [
  'partner-ip-result',
  'partner-directory',
  'partner-guide',
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

/** Public, reviewed data only. No partners have been supplied or verified yet. */
export const PROXY_PROVIDERS: readonly ProxyProvider[] = [];

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
      'billing',
      'minimumPurchase',
      'support',
    ] as const)
      text(provider[field], field);
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
export const HAS_PROXY_PROVIDERS = ACTIVE_PROXY_PROVIDERS.length > 0;

export function providersForPlacement(
  placement: PartnerPlacement,
  providers: readonly ActiveProxyProvider[] = ACTIVE_PROXY_PROVIDERS
): readonly ActiveProxyProvider[] {
  const selected = providers.filter(
    (provider) => provider.outboundUrls[placement]
  );
  return placement === 'partner-ip-result' ? selected.slice(0, 2) : selected;
}
