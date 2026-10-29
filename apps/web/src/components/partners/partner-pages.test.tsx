import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fixtures from '../../../../../scripts/fixtures/proxy-providers.json';
import type { ActiveProxyProvider } from '@/lib/proxy-providers';

afterEach(() => {
  vi.doUnmock('@/lib/proxy-providers');
  vi.resetModules();
});

describe('static partner surfaces', () => {
  it.each([0, 1, 3])(
    'renders a reviewed %i-provider catalog coherently without JavaScript',
    async (count) => {
      const actual = await vi.importActual<
        typeof import('@/lib/proxy-providers')
      >('@/lib/proxy-providers');
      const providers = fixtures.slice(0, count) as ActiveProxyProvider[];
      actual.validateProxyProviders(providers);
      vi.doMock('@/lib/proxy-providers', () => ({
        ...actual,
        ACTIVE_PROXY_PROVIDERS: providers,
        HAS_PROXY_PROVIDERS: count > 0,
        providersForPlacement: (
          placement: Parameters<typeof actual.providersForPlacement>[0]
        ) => actual.providersForPlacement(placement, providers),
      }));
      const { default: Page, metadata } = await import(
        '@/app/proxy-providers/page'
      );
      const { IpPartnerRecommendations } = await import('./PartnerCards');
      const { navItems } = await import('@/components/MobileNav');
      const { INDEXABLE_ROUTES } = await import('@/lib/seo-routes');
      const html = renderToStaticMarkup(<Page />);
      expect((html.match(/data-partner-outbound=/g) ?? []).length).toBe(count);
      expect(html.includes('No verified partner listings')).toBe(count === 0);
      expect(metadata.robots).toMatchObject({ index: count > 0 });
      expect(navItems.some((item) => item.href === '/proxy-providers')).toBe(
        count > 0
      );
      expect(
        INDEXABLE_ROUTES.some((route) => route.path === '/proxy-providers')
      ).toBe(count > 0);
      const recommendations = renderToStaticMarkup(
        <IpPartnerRecommendations />
      );
      expect(
        (recommendations.match(/data-partner-outbound=/g) ?? []).length
      ).toBe(Math.min(2, count));
      if (count) {
        expect(html).toContain('Sponsored partnerships.');
        expect(html).toContain('rel="sponsored noopener noreferrer"');
        expect(html.toLowerCase()).toContain('referrerpolicy="no-referrer"');
        expect(html).toContain('Not a real service or offer');
      }
    }
  );
});
