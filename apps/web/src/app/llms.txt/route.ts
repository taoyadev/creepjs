import { SITE_CONFIG } from '@/lib/metadata';
import {
  FEATURED_FINGERPRINT_ROUTES,
  STATIC_SEO_ROUTES,
  absoluteUrl,
} from '@/lib/seo-routes';

export const dynamic = 'force-static';

export function GET() {
  const corePages = STATIC_SEO_ROUTES.filter(
    (route) => route.path !== '/privacy'
  )
    .map((route) => `- ${route.title}: ${absoluteUrl(route.path)}`)
    .join('\n');

  const signalPages = FEATURED_FINGERPRINT_ROUTES.map(
    (technique) =>
      `- ${technique.name}: ${absoluteUrl(`/fingerprint/${technique.slug}`)}`
  ).join('\n');

  return new Response(
    `# ${SITE_CONFIG.name}

${SITE_CONFIG.description}

## Core pages

${corePages}

## Popular fingerprint signals

${signalPages}

## API origin

- CreepJS API: ${SITE_CONFIG.apiUrl}
`,
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
      },
    }
  );
}
