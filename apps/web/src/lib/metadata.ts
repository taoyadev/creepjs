/**
 * Shared metadata configuration for CreepJS 2.0
 *
 * This file provides consistent metadata across all pages using Next.js
 * Metadata API. It includes SEO, Open Graph, Twitter Cards, and more.
 *
 * SEO Best Practices Applied:
 * - Title tags 50-60 characters
 * - Meta descriptions 150-160 characters
 * - Canonical URLs for all pages
 * - Structured data (JSON-LD) support
 */

import type { Metadata } from 'next';

// Base URL from environment variable with fallback
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://creepjs.org'
).replace(/\/$/, '');
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://api.creepjs.org'
).replace(/\/$/, '');

/**
 * Site-wide constants
 */
export const SITE_CONFIG = {
  name: 'CreepJS',
  title: 'CreepJS - Browser Fingerprinting Platform',
  description:
    'Educational, privacy-first browser fingerprinting platform. Test your digital privacy, detect tracking methods, and understand what websites see about your device.',
  url: SITE_URL,
  apiUrl: API_URL,
  ogImage: `${SITE_URL}/og-image.png`,
  twitterHandle: '@creepjs',
  keywords: [
    'browser fingerprinting',
    'privacy',
    'security',
    'web development',
    'fingerprint detection',
    'canvas fingerprinting',
    'webgl fingerprinting',
    'browser privacy',
    'anti-tracking',
    'device identification',
    'fingerprint testing',
    'online privacy',
    'privacy tools',
  ],
  author: {
    name: 'CreepJS',
    url: SITE_URL,
    email: 'hello@creepjs.org',
  },
  github: 'https://github.com/taoyadev/creepjs',
  license: 'MIT',
} as const;

/**
 * Generate default metadata for a page
 *
 * @param title - Page title (will be appended with site name)
 * @param description - Page description for meta tags
 * @param path - Relative path from site root (e.g., '/demo')
 * @param ogImage - Custom Open Graph image URL (optional)
 * @param noIndex - Set to true to prevent search engine indexing
 * @returns Metadata object for Next.js
 */
export function generateMetadata({
  title,
  description,
  path = '',
  ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title || SITE_CONFIG.title;
  const socialTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;
  const pageDescription = description || SITE_CONFIG.description;
  const canonicalUrl = `${SITE_CONFIG.url}${path}`;
  const imageUrl = ogImage || SITE_CONFIG.ogImage;

  return {
    // Basic metadata
    title: pageTitle,
    description: pageDescription,
    keywords: [...SITE_CONFIG.keywords],
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Robots directives
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title: socialTitle,
      description: pageDescription,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: socialTitle,
          type: 'image/png',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title: socialTitle,
      description: pageDescription,
      images: [imageUrl],
    },

    // Icons
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },

    // Manifest
    manifest: '/site.webmanifest',

    // Verification tags (to be filled in by site owner)
    // verification: {
    //   google: 'your-google-site-verification-code',
    //   yandex: 'your-yandex-verification-code',
    //   bing: 'your-bing-verification-code',
    // },

    // Category
    category: 'technology',
  };
}

/**
 * Default metadata for the root layout
 * This serves as the base for all pages
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  // Basic metadata
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
  creator: SITE_CONFIG.author.name,
  publisher: SITE_CONFIG.author.name,

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },

  // Icons and manifest
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },

  manifest: '/site.webmanifest',

  // Verification tags (to be configured by site owner)
  // verification: {
  //   google: 'your-google-site-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   bing: 'your-bing-verification-code',
  // },

  // Category
  category: 'technology',

  // Alternate URLs (for internationalization if needed)
  // alternates: {
  //   canonical: SITE_CONFIG.url,
  //   languages: {
  //     'en-US': SITE_CONFIG.url,
  //   },
  // },

  // Other metadata
  other: {
    'application-name': SITE_CONFIG.name,
    'msapplication-TileColor': '#000000',
  },
};

/**
 * JSON-LD Schema.org structured data generators
 */
export const structuredData = {
  /**
   * Generate Organization schema
   */
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon-512.png`,
    description: SITE_CONFIG.description,
    sameAs: [SITE_CONFIG.github],
  }),

  /**
   * Generate WebSite schema
   */
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
  }),

  /**
   * Generate WebApplication schema
   */
  webApplication: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Browser fingerprinting',
      'Canvas fingerprinting',
      'WebGL fingerprinting',
      'Privacy testing',
      'API access',
    ],
  }),

  /**
   * Generate SoftwareApplication schema (SDK)
   */
  softwareApplication: () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_CONFIG.name} SDK`,
    url: `${SITE_CONFIG.url}/docs`,
    description:
      'TypeScript SDK for integrating CreepJS fingerprinting signals in web applications.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'browser',
    installUrl: 'https://www.npmjs.com/package/@creepjs/sdk',
    downloadUrl: 'https://www.npmjs.com/package/@creepjs/sdk',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }),

  /**
   * Generate WebPage schema for crawlable tool, guide, and docs pages
   */
  webPage: ({
    name,
    description,
    path,
  }: {
    name: string;
    description: string;
    path: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${SITE_CONFIG.url}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  }),

  /**
   * Generate CollectionPage schema for crawlable route hubs
   */
  collectionPage: ({
    name,
    description,
    path,
  }: {
    name: string;
    description: string;
    path: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_CONFIG.url}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  }),

  /**
   * Generate TechArticle schema for fingerprinting explainer pages
   */
  techArticle: ({
    headline,
    description,
    path,
    keywords,
  }: {
    headline: string;
    description: string;
    path: string;
    keywords?: string[];
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    description,
    url: `${SITE_CONFIG.url}${path}`,
    keywords,
    about: 'Browser fingerprinting',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/icon-512.png`,
    },
  }),

  /**
   * Generate ItemList schema for visible index hubs
   */
  itemList: (
    items: Array<{
      name: string;
      description?: string;
      url: string;
    }>
  ) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      description: item.description,
      url: item.url,
    })),
  }),

  /**
   * Generate BreadcrumbList schema
   */
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};
