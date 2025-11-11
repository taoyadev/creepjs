import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  collectCanvasFingerprint,
  collectWebGLFingerprint,
  collectNavigatorFingerprint,
  collectScreenFingerprint,
  collectFontsFingerprint,
  collectTimezoneFingerprint,
  collectAudioFingerprint,
  collectMediaDevicesFingerprint,
  collectClientRectsFingerprint,
  collectVoicesFingerprint,
  collectSVGFingerprint,
  collectMathFingerprint,
  collectCSSFingerprint,
  collectTextMetricsFingerprint,
  collectHTMLElementFingerprint,
  collectConsoleErrorsFingerprint,
  collectDomRectFingerprint,
  collectMimeTypesFingerprint,
  collectResistanceFingerprint,
  collectContentWindowFingerprint,
  collectCSSMediaFingerprint,
} from '@creepjs/core';

// Map of fingerprint types to their collector functions
const collectors = {
  canvas: collectCanvasFingerprint,
  webgl: collectWebGLFingerprint,
  navigator: collectNavigatorFingerprint,
  screen: collectScreenFingerprint,
  fonts: collectFontsFingerprint,
  timezone: collectTimezoneFingerprint,
  audio: collectAudioFingerprint,
  'media-devices': collectMediaDevicesFingerprint,
  'emoji-rendering': collectClientRectsFingerprint,
  'speech-voices': collectVoicesFingerprint,
  'svg-rendering': collectSVGFingerprint,
  'math-precision': collectMathFingerprint,
  'css-styles': collectCSSFingerprint,
  'text-metrics': collectTextMetricsFingerprint,
  'html-element': collectHTMLElementFingerprint,
  'console-errors': collectConsoleErrorsFingerprint,
  'dom-rect': collectDomRectFingerprint,
  'mime-types': collectMimeTypesFingerprint,
  'anti-fingerprint': collectResistanceFingerprint,
  'content-window': collectContentWindowFingerprint,
  'css-media': collectCSSMediaFingerprint,
};

// Metadata for each fingerprint type (for API documentation)
const fingerprintMeta = {
  canvas: {
    name: 'Canvas Fingerprint',
    description: 'Canvas rendering fingerprint based on how the browser draws graphics',
    category: 'Graphics',
  },
  webgl: {
    name: 'WebGL Fingerprint',
    description: 'WebGL GPU information and rendering capabilities',
    category: 'Graphics',
  },
  navigator: {
    name: 'Navigator Information',
    description: 'Browser navigator properties and user agent information',
    category: 'Browser',
  },
  screen: {
    name: 'Screen Information',
    description: 'Screen resolution, color depth, and pixel ratio',
    category: 'Hardware',
  },
  fonts: {
    name: 'Font Detection',
    description: 'Installed system fonts detection',
    category: 'System',
  },
  timezone: {
    name: 'Timezone Information',
    description: 'Timezone, locale, and internationalization settings',
    category: 'System',
  },
  audio: {
    name: 'Audio Fingerprint',
    description: 'Audio context fingerprint based on audio processing characteristics',
    category: 'Audio',
  },
  'media-devices': {
    name: 'Media Devices',
    description: 'Enumeration of cameras, microphones, and speakers',
    category: 'Hardware',
  },
  'emoji-rendering': {
    name: 'Emoji Rendering',
    description: 'Emoji rendering characteristics using DOM measurements',
    category: 'Graphics',
  },
  'speech-voices': {
    name: 'Speech Synthesis Voices',
    description: 'Available text-to-speech voices',
    category: 'Audio',
  },
  'svg-rendering': {
    name: 'SVG Rendering',
    description: 'SVG rendering characteristics',
    category: 'Graphics',
  },
  'math-precision': {
    name: 'Math Precision',
    description: 'JavaScript Math operation precision',
    category: 'System',
  },
  'css-styles': {
    name: 'CSS Styles',
    description: 'Computed CSS styles and system fonts',
    category: 'Browser',
  },
  'text-metrics': {
    name: 'Text Metrics',
    description: 'Text measurement and rendering characteristics',
    category: 'Graphics',
  },
  'html-element': {
    name: 'HTML Element Features',
    description: 'HTML element prototype properties and methods',
    category: 'Browser',
  },
  'console-errors': {
    name: 'Console Errors',
    description: 'Console error patterns and stack traces',
    category: 'System',
  },
  'dom-rect': {
    name: 'DOM Rectangle',
    description: 'DOM rectangle measurement precision',
    category: 'Browser',
  },
  'mime-types': {
    name: 'MIME Types',
    description: 'Browser-supported MIME types',
    category: 'Browser',
  },
  'anti-fingerprint': {
    name: 'Anti-Fingerprinting Detection',
    description: 'Detection of privacy tools and browser modifications',
    category: 'Privacy',
  },
  'content-window': {
    name: 'Content Window',
    description: 'iframe contentWindow object characteristics',
    category: 'Browser',
  },
  'css-media': {
    name: 'CSS Media Queries',
    description: 'CSS media queries and system preferences detection',
    category: 'Browser',
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  // Check if type is valid
  if (!collectors[type as keyof typeof collectors]) {
    return NextResponse.json(
      {
        error: 'Invalid fingerprint type',
        validTypes: Object.keys(collectors),
      },
      { status: 400 }
    );
  }

  try {
    const collector = collectors[type as keyof typeof collectors];
    const data = await collector();

    return NextResponse.json({
      success: true,
      type,
      meta: fingerprintMeta[type as keyof typeof fingerprintMeta],
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`Error collecting ${type} fingerprint:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to collect fingerprint',
        type,
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
