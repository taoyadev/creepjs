import { FINGERPRINT_TECHNIQUES } from '@/lib/seo-routes';

const COLLECTOR_SLUG_ALIASES: Readonly<Record<string, string>> = {
  clientRects: 'emoji-rendering',
  media: 'media-devices',
  voices: 'speech-voices',
  svg: 'svg-rendering',
  math: 'math-precision',
  css: 'css-styles',
  resistance: 'anti-fingerprint',
  cssMedia: 'css-media',
  pdfViewerEnabled: 'pdf-viewer',
  cookiesEnabled: 'cookies-enabled',
  indexedDB: 'indexed-db',
};

function camelToKebab(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function getCollectorTechnique(collectorKey: string) {
  const slug =
    COLLECTOR_SLUG_ALIASES[collectorKey] ?? camelToKebab(collectorKey);
  return FINGERPRINT_TECHNIQUES.find((technique) => technique.slug === slug);
}
