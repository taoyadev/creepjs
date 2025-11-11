import type { Metadata } from 'next';
import FingerprintPlayground from './FingerprintPlayground';

// Metadata for each fingerprint type (for SEO)
const fingerprintMetaForSEO: Record<string, {
  name: string;
  description: string;
  category: string;
}> = {
  canvas: { name: 'Canvas Fingerprint', description: 'Canvas rendering fingerprint based on how the browser draws graphics. Test your browser\'s unique canvas signature.', category: 'Graphics' },
  webgl: { name: 'WebGL Fingerprint', description: 'WebGL GPU information and rendering capabilities. Detect your graphics card and WebGL implementation.', category: 'Graphics' },
  navigator: { name: 'Navigator Information', description: 'Browser navigator properties and user agent information. Analyze browser capabilities and settings.', category: 'Browser' },
  screen: { name: 'Screen Information', description: 'Screen resolution, color depth, and pixel ratio detection. Identify display characteristics.', category: 'Hardware' },
  fonts: { name: 'Font Detection', description: 'Installed system fonts detection. Discover which fonts are available on your system.', category: 'System' },
  timezone: { name: 'Timezone Information', description: 'Timezone, locale, and internationalization settings. Detect regional and time settings.', category: 'System' },
  audio: { name: 'Audio Fingerprint', description: 'Audio context fingerprint based on audio processing characteristics. Test audio hardware signature.', category: 'Audio' },
  'media-devices': { name: 'Media Devices', description: 'Enumeration of cameras, microphones, and speakers. Detect available media devices.', category: 'Hardware' },
  'emoji-rendering': { name: 'Emoji Rendering', description: 'Emoji rendering characteristics using DOM measurements. Test how emojis are displayed.', category: 'Graphics' },
  'speech-voices': { name: 'Speech Synthesis Voices', description: 'Available text-to-speech voices. Discover TTS capabilities and voices.', category: 'Audio' },
  'svg-rendering': { name: 'SVG Rendering', description: 'SVG rendering characteristics. Test vector graphics rendering.', category: 'Graphics' },
  'math-precision': { name: 'Math Precision', description: 'JavaScript Math operation precision. Test floating-point arithmetic accuracy.', category: 'System' },
  'css-styles': { name: 'CSS Styles', description: 'Computed CSS styles and system fonts. Analyze CSS implementation differences.', category: 'Browser' },
  'text-metrics': { name: 'Text Metrics', description: 'Text measurement and rendering characteristics. Test text rendering engine.', category: 'Graphics' },
  'html-element': { name: 'HTML Element Features', description: 'HTML element prototype properties and methods. Detect DOM API features.', category: 'Browser' },
  'console-errors': { name: 'Console Errors', description: 'Console error patterns and stack traces. Analyze JavaScript engine differences.', category: 'System' },
  'dom-rect': { name: 'DOM Rectangle', description: 'DOM rectangle measurement precision. Test layout engine measurement.', category: 'Browser' },
  'mime-types': { name: 'MIME Types', description: 'Browser-supported MIME types. Discover media format capabilities.', category: 'Browser' },
  'anti-fingerprint': { name: 'Anti-Fingerprinting Detection', description: 'Detection of privacy tools and browser modifications. Identify fingerprint resistance.', category: 'Privacy' },
  'content-window': { name: 'Content Window', description: 'iframe contentWindow object characteristics. Test iframe API features.', category: 'Browser' },
  'css-media': { name: 'CSS Media Queries', description: 'CSS media queries and system preferences detection. Test browser media query support.', category: 'Browser' },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const meta = fingerprintMetaForSEO[type];

  if (!meta) {
    return {
      title: 'Invalid Fingerprint Type | CreepJS',
    };
  }

  return {
    title: `${meta.name} | Browser Fingerprinting API | CreepJS.org`,
    description: meta.description,
    keywords: [
      'browser fingerprinting',
      meta.name.toLowerCase(),
      type,
      'fingerprint detection',
      'browser tracking',
      'device fingerprint',
      'privacy',
      'web security',
      meta.category.toLowerCase(),
    ],
    openGraph: {
      title: `${meta.name} - Browser Fingerprinting`,
      description: meta.description,
      type: 'website',
      url: `https://creepjs.org/fingerprint/${type}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.name} - Browser Fingerprinting`,
      description: meta.description,
    },
  };
}

export default async function FingerprintPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <FingerprintPlayground type={type} />;
}
