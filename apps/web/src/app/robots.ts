import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '../lib/metadata';

export const dynamic = 'force-static';

/**
 * Generate robots.txt for the CreepJS website
 *
 * This file defines crawling rules for search engine bots.
 * It's automatically generated and served at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep render assets crawlable. Blocking /_next can prevent search
        // engines from rendering client-heavy tool pages.
        disallow: ['/api/*', '/v1/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
