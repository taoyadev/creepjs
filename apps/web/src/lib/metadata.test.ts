import { describe, expect, it } from 'vitest';

import { metadata as ipProxyPilotMetadata } from '../app/ip-lookup/how-to-tell-if-an-ip-is-a-proxy/page';
import { generateMetadata, SITE_CONFIG } from './metadata';
import {
  IP_PROXY_PILOT_PATH,
  IP_PROXY_PILOT_ROUTE,
} from './seo-routes';

describe('generateMetadata', () => {
  it('generates canonical URLs and OpenGraph metadata', () => {
    const metadata = generateMetadata({
      title: 'Docs',
      description: 'Documentation hub',
      path: '/docs',
    });

    expect(metadata.title).toBe('Docs');
    expect(metadata.description).toBe('Documentation hub');
    expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.url}/docs`);
    expect(metadata.openGraph).toMatchObject({
      url: `${SITE_CONFIG.url}/docs`,
      title: `Docs | ${SITE_CONFIG.name}`,
      images: [{ url: SITE_CONFIG.ogImage }],
    });
  });

  it('publishes unique metadata for the IP proxy pilot', () => {
    expect(ipProxyPilotMetadata.title).toBe(IP_PROXY_PILOT_ROUTE.title);
    expect(ipProxyPilotMetadata.description).toBe(
      IP_PROXY_PILOT_ROUTE.description
    );
    expect(ipProxyPilotMetadata.alternates?.canonical).toBe(
      `${SITE_CONFIG.url}${IP_PROXY_PILOT_PATH}`
    );
  });
});
