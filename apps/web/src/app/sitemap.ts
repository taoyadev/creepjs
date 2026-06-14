import type { MetadataRoute } from 'next';
import {
  INDEXABLE_ROUTES,
  LAST_SEO_UPDATE,
  absoluteUrl,
} from '../lib/seo-routes';

export const dynamic = 'force-static';

/**
 * Generate sitemap.xml for CreepJS - Browser Fingerprinting Platform
 *
 * Keep this wired to the route registry so indexable pages, internal-link
 * hubs, and sitemap output do not drift apart.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: LAST_SEO_UPDATE,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
