import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '../lib/metadata';

export const dynamic = 'force-static';

/**
 * Explicit AI/search crawler policy reviewed 2026-07-28.
 *
 * Sources:
 * - https://developers.openai.com/api/docs/bots
 * - https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
 * - https://docs.perplexity.ai/docs/resources/perplexity-crawlers
 * - https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
 *
 * These groups document an allow policy; they are not identity verification.
 * User-triggered fetchers may ignore robots.txt, and Google-Extended is a
 * product-control token rather than a distinct HTTP user agent.
 */
export const AI_CRAWLER_USER_AGENTS = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
] as const;

export const RESTRICTED_WEB_PATHS = ['/api/*', '/v1/*'] as const;

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
        disallow: [...RESTRICTED_WEB_PATHS],
      },
      {
        userAgent: [...AI_CRAWLER_USER_AGENTS],
        allow: '/',
        // Repeat wildcard restrictions: specific groups take precedence in
        // robots matching and must not silently broaden these paths.
        disallow: [...RESTRICTED_WEB_PATHS],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
