import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  providersForPlacement,
  validateProxyProviders,
  PROXY_PROVIDERS,
  type ActiveProxyProvider,
} from './proxy-providers';

// Reserved .test domains: fixtures are never included in the published catalog.
const provider: ActiveProxyProvider = {
  id: 'test-provider',
  status: 'active',
  name: 'Test fixture only',
  order: 1,
  websiteUrl: 'https://provider.test',
  approvedHosts: ['provider.test'],
  productTypes: ['Test type'],
  regions: 'Not disclosed',
  protocols: 'Not disclosed',
  sessionPolicy: 'Not disclosed',
  priceFrom: 'Not disclosed',
  tagline: 'Fixture tagline',
  billing: 'Not disclosed',
  minimumPurchase: 'Not disclosed',
  support: 'Not disclosed',
  bestFor: ['Fixture evaluation'],
  limitations: ['Not a real offer'],
  sources: [{ title: 'Fixture source', url: 'https://provider.test/docs' }],
  verifiedAt: '2026-10-29',
  outboundUrls: {
    'partner-directory': 'https://provider.test/plans?channel=directory',
    'partner-ip-result': 'https://provider.test/plans?channel=ip',
  },
};
describe('reviewed provider configuration', () => {
  it('accepts empty and paused-only catalogs, and validates the published source', () => {
    expect(() => validateProxyProviders([])).not.toThrow();
    expect(() =>
      validateProxyProviders([{ id: 'retired-id', status: 'paused' }])
    ).not.toThrow();
    expect(() => validateProxyProviders(PROXY_PROVIDERS)).not.toThrow();
    // Every published icon is a real self-hosted file.
    for (const item of PROXY_PROVIDERS)
      if (item.status === 'active' && item.iconPath)
        expect(
          existsSync(join(__dirname, '../../public', item.iconPath)),
          item.iconPath
        ).toBe(true);
  });
  it('accepts complete active records and uses only configured placements', () => {
    validateProxyProviders([provider]);
    expect(providersForPlacement('partner-guide', [provider])).toEqual([]);
    expect(providersForPlacement('partner-ip-result', [provider])).toEqual([
      provider,
    ]);
    const three = [
      provider,
      { ...provider, id: 'second' },
      { ...provider, id: 'third' },
    ];
    expect(providersForPlacement('partner-ip-result', three)).toHaveLength(2);
    expect(providersForPlacement('partner-directory', three)).toHaveLength(3);
  });
  it('rejects reused IDs even when a provider is paused', () => {
    expect(() =>
      validateProxyProviders([provider, { id: provider.id, status: 'paused' }])
    ).toThrow('duplicate id');
  });
  it.each([
    { id: undefined },
    { id: 'bad id' },
    { id: 'x'.repeat(49) },
    { name: '' },
    { order: NaN },
    { verifiedAt: '2026-02-30' },
    { verifiedAt: '2026-13-01' },
    { verifiedAt: '2099-01-01' },
    { limitations: [] },
    { sources: [] },
    { approvedHosts: [] },
    { websiteUrl: 'http://provider.test' },
    { websiteUrl: 'https://name:password@provider.test' },
    { websiteUrl: 'https://provider.test.evil.test' },
    { outboundUrls: {} },
    { outboundUrls: { 'partner-directory': 'javascript:alert(1)' } },
    {
      outboundUrls: {
        'partner-directory': 'https://provider.test',
        invalid: 'https://provider.test',
      },
    },
  ])('rejects incomplete or unreviewed data: %j', (override) => {
    expect(() =>
      validateProxyProviders(
        [{ ...provider, ...override } as ActiveProxyProvider],
        '2026-10-29'
      )
    ).toThrow('Invalid proxy provider');
  });
});
