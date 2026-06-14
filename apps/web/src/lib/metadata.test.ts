import { describe, expect, it } from 'vitest';

import { generateMetadata, SITE_CONFIG } from './metadata';

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
});
