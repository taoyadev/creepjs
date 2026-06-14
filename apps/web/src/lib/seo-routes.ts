import { SITE_CONFIG } from './metadata';

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  section: 'core' | 'docs' | 'guide' | 'fingerprint' | 'legal';
  changeFrequency: ChangeFrequency;
  priority: number;
}

export interface FingerprintTechnique {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export const LAST_SEO_UPDATE = new Date('2026-06-13');

export const STATIC_SEO_ROUTES = [
  {
    path: '/',
    title: 'Browser Fingerprinting Platform',
    description:
      'Run a privacy-first browser fingerprint check and learn what websites can infer about your device.',
    section: 'core',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/checker',
    title: 'Fingerprint Checker',
    description:
      'Test your browser privacy with a live fingerprint scan, collector coverage, and privacy leakage analysis.',
    section: 'core',
    changeFrequency: 'weekly',
    priority: 0.95,
  },
  {
    path: '/ip',
    title: 'IP Risk Checker',
    description:
      'Check IP risk, ASN, geolocation, proxy, VPN, Tor, datacenter, and routing signals through the CreepJS API.',
    section: 'core',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/fingerprint',
    title: 'Browser Fingerprint Signals',
    description:
      'Browse the full CreepJS library of browser fingerprinting signals, including canvas, WebGL, WebRTC, fonts, storage, and privacy checks.',
    section: 'fingerprint',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/docs',
    title: 'Documentation',
    description:
      'Read the CreepJS API, SDK, collector, and integration documentation for privacy-first browser fingerprinting.',
    section: 'docs',
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    path: '/playground',
    title: 'API Playground',
    description:
      'Generate a token, inspect sample payloads, and test CreepJS browser fingerprinting API calls.',
    section: 'core',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/guide/what-is-browser-fingerprinting',
    title: 'What Is Browser Fingerprinting?',
    description:
      'Learn how browser fingerprinting works, which signals are collected, and how privacy tools reduce tracking.',
    section: 'guide',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description:
      'Review how CreepJS handles privacy, client-side fingerprinting, API tokens, and data minimization.',
    section: 'legal',
    changeFrequency: 'yearly',
    priority: 0.55,
  },
] as const satisfies readonly SeoRoute[];

export const FINGERPRINT_TECHNIQUES = [
  {
    slug: 'canvas',
    name: 'Canvas Fingerprint',
    description:
      "Canvas rendering fingerprint based on how the browser draws graphics. Test your browser's unique canvas signature.",
    category: 'Graphics',
  },
  {
    slug: 'webgl',
    name: 'WebGL Fingerprint',
    description:
      'WebGL GPU information and rendering capabilities. Detect your graphics card and WebGL implementation.',
    category: 'Graphics',
  },
  {
    slug: 'navigator',
    name: 'Navigator Information',
    description:
      'Browser navigator properties and user agent information. Analyze browser capabilities and settings.',
    category: 'Browser',
  },
  {
    slug: 'screen',
    name: 'Screen Information',
    description:
      'Screen resolution, color depth, and pixel ratio detection. Identify display characteristics.',
    category: 'Hardware',
  },
  {
    slug: 'fonts',
    name: 'Font Detection',
    description:
      'Installed system fonts detection. Discover which fonts are available on your system.',
    category: 'System',
  },
  {
    slug: 'timezone',
    name: 'Timezone Information',
    description:
      'Timezone, locale, and internationalization settings. Detect regional and time settings.',
    category: 'System',
  },
  {
    slug: 'audio',
    name: 'Audio Fingerprint',
    description:
      'Audio context fingerprint based on audio processing characteristics. Test audio hardware signature.',
    category: 'Audio',
  },
  {
    slug: 'media-devices',
    name: 'Media Devices',
    description:
      'Enumeration of cameras, microphones, and speakers. Detect available media devices.',
    category: 'Hardware',
  },
  {
    slug: 'emoji-rendering',
    name: 'Emoji Rendering',
    description:
      'Emoji rendering characteristics using DOM measurements. Test how emojis are displayed.',
    category: 'Graphics',
  },
  {
    slug: 'speech-voices',
    name: 'Speech Synthesis Voices',
    description:
      'Available text-to-speech voices. Discover TTS capabilities and voices.',
    category: 'Audio',
  },
  {
    slug: 'svg-rendering',
    name: 'SVG Rendering',
    description: 'SVG rendering characteristics. Test vector graphics rendering.',
    category: 'Graphics',
  },
  {
    slug: 'math-precision',
    name: 'Math Precision',
    description:
      'JavaScript Math operation precision. Test floating-point arithmetic accuracy.',
    category: 'System',
  },
  {
    slug: 'css-styles',
    name: 'CSS Styles',
    description:
      'Computed CSS styles and system fonts. Analyze CSS implementation differences.',
    category: 'Browser',
  },
  {
    slug: 'text-metrics',
    name: 'Text Metrics',
    description:
      'Text measurement and rendering characteristics. Test text rendering engine.',
    category: 'Graphics',
  },
  {
    slug: 'html-element',
    name: 'HTML Element Features',
    description:
      'HTML element prototype properties and methods. Detect DOM API features.',
    category: 'Browser',
  },
  {
    slug: 'console-errors',
    name: 'Console Errors',
    description:
      'Console error patterns and stack traces. Analyze JavaScript engine differences.',
    category: 'System',
  },
  {
    slug: 'dom-rect',
    name: 'DOM Rectangle',
    description:
      'DOM rectangle measurement precision. Test layout engine measurement.',
    category: 'Browser',
  },
  {
    slug: 'mime-types',
    name: 'MIME Types',
    description:
      'Browser-supported MIME types. Discover media format capabilities.',
    category: 'Browser',
  },
  {
    slug: 'anti-fingerprint',
    name: 'Anti-Fingerprinting Detection',
    description:
      'Detection of privacy tools and browser modifications. Identify fingerprint resistance.',
    category: 'Privacy',
  },
  {
    slug: 'content-window',
    name: 'Content Window',
    description:
      'iframe contentWindow object characteristics. Test iframe API features.',
    category: 'Browser',
  },
  {
    slug: 'css-media',
    name: 'CSS Media Queries',
    description:
      'CSS media queries and system preferences detection. Test browser media query support.',
    category: 'Browser',
  },
  {
    slug: 'screen-frame',
    name: 'Screen Frame Detection',
    description:
      'Screen frame and taskbar detection revealing OS interface characteristics.',
    category: 'Hardware',
  },
  {
    slug: 'screen-resolution',
    name: 'Screen Resolution',
    description: 'Detailed screen resolution detection for device model inference.',
    category: 'Hardware',
  },
  {
    slug: 'color-depth',
    name: 'Color Depth',
    description:
      'Display color depth detection for screen quality tier identification.',
    category: 'Hardware',
  },
  {
    slug: 'color-gamut',
    name: 'Color Gamut',
    description: 'Display color gamut detection for screen quality assessment.',
    category: 'Hardware',
  },
  {
    slug: 'hardware-concurrency',
    name: 'Hardware Concurrency',
    description: 'CPU core count detection revealing device performance tier.',
    category: 'Hardware',
  },
  {
    slug: 'device-memory',
    name: 'Device Memory',
    description: 'Device RAM detection for hardware capability profiling.',
    category: 'Hardware',
  },
  {
    slug: 'touch-support',
    name: 'Touch Support',
    description:
      'Touch input capability detection for device type identification.',
    category: 'Hardware',
  },
  {
    slug: 'monochrome',
    name: 'Monochrome Display',
    description: 'Monochrome display detection via media queries.',
    category: 'Hardware',
  },
  {
    slug: 'hdr',
    name: 'HDR Support',
    description: 'High Dynamic Range display capability detection.',
    category: 'Hardware',
  },
  {
    slug: 'vendor',
    name: 'Browser Vendor',
    description: 'Browser vendor string detection for browser identification.',
    category: 'Browser',
  },
  {
    slug: 'vendor-flavors',
    name: 'Vendor Flavors',
    description: 'Browser vendor-specific feature detection.',
    category: 'Browser',
  },
  {
    slug: 'plugins',
    name: 'Browser Plugins',
    description:
      'Installed browser plugins enumeration for software profiling.',
    category: 'Browser',
  },
  {
    slug: 'pdf-viewer',
    name: 'PDF Viewer Support',
    description: 'Native PDF viewing capability detection.',
    category: 'Browser',
  },
  {
    slug: 'cookies-enabled',
    name: 'Cookies Enabled',
    description: 'Cookie support detection for browser configuration.',
    category: 'Browser',
  },
  {
    slug: 'indexed-db',
    name: 'IndexedDB Support',
    description: 'IndexedDB API availability detection.',
    category: 'Browser',
  },
  {
    slug: 'local-storage',
    name: 'Local Storage',
    description: 'LocalStorage API availability detection.',
    category: 'Browser',
  },
  {
    slug: 'session-storage',
    name: 'Session Storage',
    description: 'SessionStorage API availability detection.',
    category: 'Browser',
  },
  {
    slug: 'open-database',
    name: 'Open Database',
    description: 'WebSQL/OpenDatabase API availability detection.',
    category: 'Browser',
  },
  {
    slug: 'languages',
    name: 'Language Preferences',
    description: 'Browser language preferences revealing user demographics.',
    category: 'System',
  },
  {
    slug: 'platform',
    name: 'Platform Detection',
    description: 'Operating system platform detection via Navigator API.',
    category: 'System',
  },
  {
    slug: 'date-time-locale',
    name: 'Date/Time Locale',
    description:
      'Date and time formatting preferences for locale detection.',
    category: 'System',
  },
  {
    slug: 'architecture',
    name: 'CPU Architecture',
    description: 'CPU architecture detection via Navigator API.',
    category: 'System',
  },
  {
    slug: 'cpu-class',
    name: 'CPU Class',
    description: 'Legacy CPU class detection for IE compatibility.',
    category: 'System',
  },
  {
    slug: 'os-cpu',
    name: 'OS CPU',
    description: 'Operating system CPU information detection.',
    category: 'System',
  },
  {
    slug: 'reduced-motion',
    name: 'Reduced Motion',
    description:
      'Motion sensitivity preference detection for accessibility.',
    category: 'Accessibility',
  },
  {
    slug: 'reduced-transparency',
    name: 'Reduced Transparency',
    description: 'Transparency preference detection for accessibility.',
    category: 'Accessibility',
  },
  {
    slug: 'inverted-colors',
    name: 'Inverted Colors',
    description: 'Color inversion preference detection for accessibility.',
    category: 'Accessibility',
  },
  {
    slug: 'forced-colors',
    name: 'Forced Colors',
    description: 'Windows High Contrast mode detection.',
    category: 'Accessibility',
  },
  {
    slug: 'contrast',
    name: 'Contrast Preference',
    description: 'Contrast preference detection for accessibility.',
    category: 'Accessibility',
  },
  {
    slug: 'font-preferences',
    name: 'Font Preferences',
    description: 'System font preferences detection for OS identification.',
    category: 'System',
  },
  {
    slug: 'private-click-measurement',
    name: 'Private Click Measurement',
    description:
      'Apple PCM API support detection indicating Safari browser.',
    category: 'Privacy',
  },
  {
    slug: 'webrtc',
    name: 'WebRTC Fingerprint',
    description:
      'WebRTC capabilities and IP leakage checks. Detect peer connection support and potential network exposure signals.',
    category: 'Network',
  },
  {
    slug: 'service-worker',
    name: 'Service Worker Fingerprint',
    description:
      'Service Worker support and registration features. Detect offline capabilities and worker availability.',
    category: 'Network',
  },
  {
    slug: 'lies',
    name: 'Lies Detection',
    description:
      'Inconsistency analysis across fingerprint components. Helps detect spoofing, privacy tools, and mismatched signals.',
    category: 'Privacy',
  },
] as const satisfies readonly FingerprintTechnique[];

export const FINGERPRINT_SEO_BY_SLUG = Object.fromEntries(
  FINGERPRINT_TECHNIQUES.map((technique) => [technique.slug, technique])
) as Record<string, FingerprintTechnique>;

export const FINGERPRINT_SEO_ROUTES = FINGERPRINT_TECHNIQUES.map(
  (technique) =>
    ({
      path: `/fingerprint/${technique.slug}`,
      title: technique.name,
      description: technique.description,
      section: 'fingerprint',
      changeFrequency: 'monthly',
      priority: 0.62,
    }) satisfies SeoRoute
);

export const INDEXABLE_ROUTES = [
  ...STATIC_SEO_ROUTES,
  ...FINGERPRINT_SEO_ROUTES,
] as const satisfies readonly SeoRoute[];

export const FEATURED_FINGERPRINT_SLUGS = [
  'canvas',
  'webgl',
  'webrtc',
  'anti-fingerprint',
  'navigator',
  'fonts',
] as const;

export const FEATURED_FINGERPRINT_ROUTES = FEATURED_FINGERPRINT_SLUGS.map(
  (slug) => FINGERPRINT_SEO_BY_SLUG[slug]
);

export function absoluteUrl(path: string) {
  if (path === '/') return SITE_CONFIG.url;
  return `${SITE_CONFIG.url}${path}`;
}
