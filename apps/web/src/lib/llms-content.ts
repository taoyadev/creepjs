import { SITE_CONFIG } from './metadata';
import {
  FINGERPRINT_TECHNIQUES,
  STATIC_SEO_ROUTES,
  absoluteUrl,
} from './seo-routes';

export const LLMS_FULL_PATH = '/llms-full.txt';

export const PRODUCT_IDENTITY_TEXT =
  'CreepJS.org is a privacy diagnostic and API for browser-fingerprint and IP-risk signals. It is distinct from the separate open-source CreepJS research project maintained by Abraham Juliot.';

function signalGroups(): Array<{
  category: string;
  signals: Array<(typeof FINGERPRINT_TECHNIQUES)[number]>;
}> {
  const groups = new Map<
    string,
    Array<(typeof FINGERPRINT_TECHNIQUES)[number]>
  >();

  for (const signal of FINGERPRINT_TECHNIQUES) {
    const entries = groups.get(signal.category) ?? [];
    entries.push(signal);
    groups.set(signal.category, entries);
  }

  return [...groups].map(([category, signals]) => ({ category, signals }));
}

export function buildLlmsIndex(): string {
  const publicRoutes = STATIC_SEO_ROUTES.filter(
    (route) => route.section !== 'legal'
  )
    .map(
      (route) =>
        `- ${route.title}: ${absoluteUrl(route.path)}\n  ${route.description}`
    )
    .join('\n');

  const signals = signalGroups()
    .map(
      ({ category, signals: entries }) => `### ${category}

${entries
  .map(
    (signal) => `- ${signal.name}
  - HTML: ${absoluteUrl(`/fingerprint/${signal.slug}`)}
  - Markdown: ${absoluteUrl(`/content/fingerprints/${signal.slug}.md`)}`
  )
  .join('\n')}`
    )
    .join('\n\n');

  return `# CreepJS

${PRODUCT_IDENTITY_TEXT}

- Official site: ${SITE_CONFIG.url}
- Official source: ${SITE_CONFIG.github}
- API origin: ${SITE_CONFIG.apiUrl}
- Separate research project: https://github.com/abrahamjuliot/creepjs

This file is a deterministic navigation aid for systems that choose to read it. Google Search does not use llms.txt as a ranking or generative-search requirement.

## Tools and guides

${publicRoutes}

## Fingerprint signals

${signals}

## Expanded text

- Vetted combined signal references: ${absoluteUrl(LLMS_FULL_PATH)}
`;
}
