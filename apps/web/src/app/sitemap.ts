import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

export const dynamic = 'force-static';

/**
 * Generate sitemap.xml for the CreepJS website
 *
 * This sitemap includes all static pages and dynamic fingerprint detail pages.
 * It's automatically generated at build time and served at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/checker`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playground`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic fingerprint detail pages
  // These correspond to the individual fingerprinting techniques
  const fingerprintTypes = [
    'canvas',
    'webgl',
    'navigator',
    'screen',
    'fonts',
    'timezone',
    'audio',
    'media-devices',
    'emoji-rendering',
    'speech-voices',
    'svg-rendering',
    'math-precision',
    'css-styles',
    'text-metrics',
    'html-element',
    'console-errors',
    'dom-rect',
    'mime-types',
    'anti-fingerprint',
    'content-window',
    'css-media',
  ];

  const fingerprintPages: MetadataRoute.Sitemap = fingerprintTypes.map(
    (type) => ({
      url: `${baseUrl}/fingerprint/${type}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...fingerprintPages];
}
