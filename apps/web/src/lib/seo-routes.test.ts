import { describe, expect, it } from 'vitest';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import {
  FINGERPRINT_SEO_ROUTES,
  FINGERPRINT_TECHNIQUES,
  INDEXABLE_ROUTES,
  IP_PROXY_PILOT_PATH,
  IP_PROXY_PILOT_ROUTE,
  LAST_SEO_UPDATE,
  STATIC_SEO_ROUTES,
} from './seo-routes';
import { SITE_CONFIG } from './metadata';

describe('SEO route registry', () => {
  it('keeps every indexable route unique and production-canonical', () => {
    const paths = INDEXABLE_ROUTES.map((route) => route.path);
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(INDEXABLE_ROUTES.length);
    expect(urls.every((url) => url.startsWith(SITE_CONFIG.url))).toBe(true);
    expect(urls.some((url) => url.includes('pages.dev'))).toBe(false);
  });

  it('publishes the fingerprint hub and all fingerprint detail pages', () => {
    expect(STATIC_SEO_ROUTES.map((route) => route.path)).toContain(
      '/fingerprint'
    );
    expect(FINGERPRINT_SEO_ROUTES).toHaveLength(FINGERPRINT_TECHNIQUES.length);
    expect(FINGERPRINT_SEO_ROUTES.length).toBeGreaterThan(50);
    expect(FINGERPRINT_SEO_ROUTES.map((route) => route.path)).toEqual(
      FINGERPRINT_TECHNIQUES.map(
        (technique) => `/fingerprint/${technique.slug}`
      )
    );
  });

  it('publishes the proxy-intent pilot exactly once with its own content date', () => {
    const entries = sitemap().filter(
      (entry) => entry.url === `${SITE_CONFIG.url}${IP_PROXY_PILOT_PATH}`
    );
    const checker = sitemap().find(
      (entry) => entry.url === `${SITE_CONFIG.url}/checker`
    );

    expect(
      STATIC_SEO_ROUTES.filter(
        (route) => route.path === IP_PROXY_PILOT_PATH
      )
    ).toHaveLength(1);
    expect(IP_PROXY_PILOT_ROUTE.section).toBe('ip-lookup');
    expect(entries).toHaveLength(1);
    expect(entries[0]?.lastModified).toEqual(
      IP_PROXY_PILOT_ROUTE.lastModified
    );
    expect(checker?.lastModified).toEqual(LAST_SEO_UPDATE);
  });

  it('keeps render assets crawlable in robots.txt', () => {
    const rules = robots().rules;
    const allRules = Array.isArray(rules) ? rules : [rules];
    const disallowed = allRules.flatMap((rule) => rule.disallow ?? []);

    expect(disallowed).not.toContain('/_next/*');
    expect(disallowed).not.toContain('/static/*');
    expect(robots().sitemap).toBe(`${SITE_CONFIG.url}/sitemap.xml`);
  });
});
