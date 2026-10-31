import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import fixtures from '../../../../../scripts/fixtures/proxy-providers.json';
import {
  providersForPlacement,
  type ActiveProxyProvider,
} from '@/lib/proxy-providers';
import { SponsorRail, sponsorRailSlots } from './SponsorRails';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const make = (count: number): ActiveProxyProvider[] =>
  Array.from({ length: count }, (_, index) => {
    const base = fixtures[0] as ActiveProxyProvider;
    return {
      ...base,
      id: `provider-${index}`,
      order: index,
      outboundUrls: {
        ...base.outboundUrls,
        'partner-sidebar': base.outboundUrls['partner-directory'],
      },
    };
  });

const sizes = (count: number) => {
  const { left, right } = sponsorRailSlots(
    providersForPlacement('partner-sidebar', make(count))
  );
  return [left.length, right.length, right.at(-1)];
};

describe('sponsor rails', () => {
  it('keeps the rails symmetric and the advertise slot last', () => {
    expect(sizes(0)).toEqual([1, 0, undefined]);
    expect(sizes(5)).toEqual([3, 3, 'advertise']);
    expect(sizes(7)).toEqual([4, 4, 'advertise']);
    // Never more than 8 slots: one stays open for advertisers.
    expect(sizes(12)).toEqual([4, 4, 'advertise']);
  });

  it('renders disclosed sponsor links and one advertise button', () => {
    const html =
      renderToStaticMarkup(<SponsorRail side="left" />) +
      renderToStaticMarkup(<SponsorRail side="right" />);
    const { left, right } = sponsorRailSlots();
    const providers = left.length + right.length - 1;
    expect((html.match(/data-partner-outbound=/g) ?? []).length).toBe(
      providers
    );
    expect(
      (html.match(/rel="sponsored noopener noreferrer"/g) ?? []).length
    ).toBe(providers);
    expect((html.match(/aria-label="Advertise here"/g) ?? []).length).toBe(1);
    expect(html).toContain('data-partner-placement="partner-sidebar"');
    expect(html).toContain('aria-label="Sponsors"');
    expect(html).toContain('aria-label="More sponsors"');
  });
});
