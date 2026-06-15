import type { Metadata } from 'next';
import FingerprintPlayground from './FingerprintPlayground';
import {
  SITE_CONFIG,
  generateMetadata as buildMetadata,
  structuredData,
} from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';

// Metadata for each fingerprint type (for SEO)
const fingerprintMetaForSEO: Record<
  string,
  {
    name: string;
    description: string;
    category: string;
  }
> = {
  canvas: {
    name: 'Canvas Fingerprint',
    description:
      "Canvas rendering fingerprint based on how the browser draws graphics. Test your browser's unique canvas signature.",
    category: 'Graphics',
  },
  webgl: {
    name: 'WebGL Fingerprint',
    description:
      'WebGL GPU information and rendering capabilities. Detect your graphics card and WebGL implementation.',
    category: 'Graphics',
  },
  navigator: {
    name: 'Navigator Information',
    description:
      'Browser navigator properties and user agent information. Analyze browser capabilities and settings.',
    category: 'Browser',
  },
  screen: {
    name: 'Screen Information',
    description:
      'Screen resolution, color depth, and pixel ratio detection. Identify display characteristics.',
    category: 'Hardware',
  },
  fonts: {
    name: 'Font Detection',
    description:
      'Installed system fonts detection. Discover which fonts are available on your system.',
    category: 'System',
  },
  timezone: {
    name: 'Timezone Information',
    description:
      'Timezone, locale, and internationalization settings. Detect regional and time settings.',
    category: 'System',
  },
  audio: {
    name: 'Audio Fingerprint',
    description:
      'Audio context fingerprint based on audio processing characteristics. Test audio hardware signature.',
    category: 'Audio',
  },
  'media-devices': {
    name: 'Media Devices',
    description:
      'Enumeration of cameras, microphones, and speakers. Detect available media devices.',
    category: 'Hardware',
  },
  'emoji-rendering': {
    name: 'Emoji Rendering',
    description:
      'Emoji rendering characteristics using DOM measurements. Test how emojis are displayed.',
    category: 'Graphics',
  },
  'speech-voices': {
    name: 'Speech Synthesis Voices',
    description:
      'Available text-to-speech voices. Discover TTS capabilities and voices.',
    category: 'Audio',
  },
  'svg-rendering': {
    name: 'SVG Rendering',
    description:
      'SVG rendering characteristics. Test vector graphics rendering.',
    category: 'Graphics',
  },
  'math-precision': {
    name: 'Math Precision',
    description:
      'JavaScript Math operation precision. Test floating-point arithmetic accuracy.',
    category: 'System',
  },
  'css-styles': {
    name: 'CSS Styles',
    description:
      'Computed CSS styles and system fonts. Analyze CSS implementation differences.',
    category: 'Browser',
  },
  'text-metrics': {
    name: 'Text Metrics',
    description:
      'Text measurement and rendering characteristics. Test text rendering engine.',
    category: 'Graphics',
  },
  'html-element': {
    name: 'HTML Element Features',
    description:
      'HTML element prototype properties and methods. Detect DOM API features.',
    category: 'Browser',
  },
  'console-errors': {
    name: 'Console Errors',
    description:
      'Console error patterns and stack traces. Analyze JavaScript engine differences.',
    category: 'System',
  },
  'dom-rect': {
    name: 'DOM Rectangle',
    description:
      'DOM rectangle measurement precision. Test layout engine measurement.',
    category: 'Browser',
  },
  'mime-types': {
    name: 'MIME Types',
    description:
      'Browser-supported MIME types. Discover media format capabilities.',
    category: 'Browser',
  },
  'anti-fingerprint': {
    name: 'Anti-Fingerprinting Detection',
    description:
      'Detection of privacy tools and browser modifications. Identify fingerprint resistance.',
    category: 'Privacy',
  },
  'content-window': {
    name: 'Content Window',
    description:
      'iframe contentWindow object characteristics. Test iframe API features.',
    category: 'Browser',
  },
  'css-media': {
    name: 'CSS Media Queries',
    description:
      'CSS media queries and system preferences detection. Test browser media query support.',
    category: 'Browser',
  },
  'screen-frame': {
    name: 'Screen Frame Detection',
    description:
      'Screen frame and taskbar detection revealing OS interface characteristics.',
    category: 'Hardware',
  },
  'screen-resolution': {
    name: 'Screen Resolution',
    description:
      'Detailed screen resolution detection for device model inference.',
    category: 'Hardware',
  },
  'color-depth': {
    name: 'Color Depth',
    description:
      'Display color depth detection for screen quality tier identification.',
    category: 'Hardware',
  },
  'hardware-concurrency': {
    name: 'Hardware Concurrency',
    description: 'CPU core count detection revealing device performance tier.',
    category: 'Hardware',
  },
  'device-memory': {
    name: 'Device Memory',
    description: 'Device RAM detection for hardware capability profiling.',
    category: 'Hardware',
  },
  languages: {
    name: 'Language Preferences',
    description: 'Browser language preferences revealing user demographics.',
    category: 'System',
  },
  platform: {
    name: 'Platform Detection',
    description: 'Operating system platform detection via Navigator API.',
    category: 'System',
  },
  vendor: {
    name: 'Browser Vendor',
    description: 'Browser vendor string detection for browser identification.',
    category: 'Browser',
  },
  plugins: {
    name: 'Browser Plugins',
    description:
      'Installed browser plugins enumeration for software profiling.',
    category: 'Browser',
  },
  'touch-support': {
    name: 'Touch Support',
    description:
      'Touch input capability detection for device type identification.',
    category: 'Hardware',
  },
  'pdf-viewer': {
    name: 'PDF Viewer Support',
    description: 'Native PDF viewing capability detection.',
    category: 'Browser',
  },
  'cookies-enabled': {
    name: 'Cookies Enabled',
    description: 'Cookie support detection for browser configuration.',
    category: 'Browser',
  },
  'color-gamut': {
    name: 'Color Gamut',
    description: 'Display color gamut detection for screen quality assessment.',
    category: 'Hardware',
  },
  'indexed-db': {
    name: 'IndexedDB Support',
    description: 'IndexedDB API availability detection.',
    category: 'Browser',
  },
  'local-storage': {
    name: 'Local Storage',
    description: 'LocalStorage API availability detection.',
    category: 'Browser',
  },
  'session-storage': {
    name: 'Session Storage',
    description: 'SessionStorage API availability detection.',
    category: 'Browser',
  },
  'open-database': {
    name: 'Open Database',
    description: 'WebSQL/OpenDatabase API availability detection.',
    category: 'Browser',
  },
  'date-time-locale': {
    name: 'Date/Time Locale',
    description: 'Date and time formatting preferences for locale detection.',
    category: 'System',
  },
  architecture: {
    name: 'CPU Architecture',
    description: 'CPU architecture detection via Navigator API.',
    category: 'System',
  },
  'cpu-class': {
    name: 'CPU Class',
    description: 'Legacy CPU class detection for IE compatibility.',
    category: 'System',
  },
  'os-cpu': {
    name: 'OS CPU',
    description: 'Operating system CPU information detection.',
    category: 'System',
  },
  'vendor-flavors': {
    name: 'Vendor Flavors',
    description: 'Browser vendor-specific feature detection.',
    category: 'Browser',
  },
  'reduced-motion': {
    name: 'Reduced Motion',
    description: 'Motion sensitivity preference detection for accessibility.',
    category: 'Accessibility',
  },
  'reduced-transparency': {
    name: 'Reduced Transparency',
    description: 'Transparency preference detection for accessibility.',
    category: 'Accessibility',
  },
  'inverted-colors': {
    name: 'Inverted Colors',
    description: 'Color inversion preference detection for accessibility.',
    category: 'Accessibility',
  },
  monochrome: {
    name: 'Monochrome Display',
    description: 'Monochrome display detection via media queries.',
    category: 'Hardware',
  },
  'forced-colors': {
    name: 'Forced Colors',
    description: 'Windows High Contrast mode detection.',
    category: 'Accessibility',
  },
  hdr: {
    name: 'HDR Support',
    description: 'High Dynamic Range display capability detection.',
    category: 'Hardware',
  },
  contrast: {
    name: 'Contrast Preference',
    description: 'Contrast preference detection for accessibility.',
    category: 'Accessibility',
  },
  'private-click-measurement': {
    name: 'Private Click Measurement',
    description: 'Apple PCM API support detection indicating Safari browser.',
    category: 'Privacy',
  },
  'font-preferences': {
    name: 'Font Preferences',
    description: 'System font preferences detection for OS identification.',
    category: 'System',
  },
  webrtc: {
    name: 'WebRTC Fingerprint',
    description:
      'WebRTC capabilities and IP leakage checks. Detect peer connection support and potential network exposure signals.',
    category: 'Network',
  },
  'service-worker': {
    name: 'Service Worker Fingerprint',
    description:
      'Service Worker support and registration features. Detect offline capabilities and worker availability.',
    category: 'Network',
  },
  lies: {
    name: 'Lies Detection',
    description:
      'Inconsistency analysis across fingerprint components. Helps detect spoofing, privacy tools, and mismatched signals.',
    category: 'Privacy',
  },
};

// Generate static params for all fingerprint types (required for static export)
export function generateStaticParams() {
  return Object.keys(fingerprintMetaForSEO).map((type) => ({
    type,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = fingerprintMetaForSEO[type];

  if (!meta) {
    return {
      title: 'Invalid Fingerprint Type | CreepJS',
    };
  }

  const baseMetadata = buildMetadata({
    title: `${meta.name} - Browser Fingerprinting`,
    description: meta.description,
    path: `/fingerprint/${type}`,
  });

  return {
    ...baseMetadata,
    keywords: [
      ...(Array.isArray(baseMetadata.keywords) ? baseMetadata.keywords : []),
      meta.name.toLowerCase(),
      type,
      meta.category.toLowerCase(),
      'fingerprint detection',
      'browser tracking',
      'device fingerprint',
    ],
  };
}

export default async function FingerprintPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const meta = fingerprintMetaForSEO[type];

  if (!meta) {
    return <FingerprintPlayground type={type} />;
  }

  return (
    <>
      <StructuredData
        data={[
          structuredData.techArticle({
            headline: `${meta.name} Browser Fingerprinting`,
            description: meta.description,
            path: `/fingerprint/${type}`,
            keywords: [
              meta.name,
              meta.category,
              'browser fingerprinting',
              'privacy testing',
            ],
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            {
              name: 'Fingerprint Signals',
              url: `${SITE_CONFIG.url}/fingerprint`,
            },
            { name: meta.name, url: `${SITE_CONFIG.url}/fingerprint/${type}` },
          ]),
        ]}
      />
      <FingerprintPlayground type={type} />
      <SeoInternalLinks
        currentPath={`/fingerprint/${type}`}
        title="Compare related fingerprint signals"
        description="Move from this collector to the CreepJS signal index, live checker, API docs, and other high-value fingerprinting explainers."
      />
    </>
  );
}
