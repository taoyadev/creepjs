import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

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
        // Disallow admin/internal paths if they exist
        disallow: [
          '/api/*', // API routes (not meant for indexing)
          '/_next/*', // Next.js internal files
          '/static/*', // Static assets handled separately
        ],
      },
      // Specific rules for Google bot
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/*'],
        // Allow Google Image bot to crawl images
        crawlDelay: 0,
      },
      // Specific rules for Bing bot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/*'],
        crawlDelay: 0,
      },
      // Block bad bots (aggressive scrapers, known bad actors)
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
