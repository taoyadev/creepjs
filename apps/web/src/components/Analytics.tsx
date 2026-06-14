/**
 * Cloudflare Web Analytics Component
 *
 * Privacy-first analytics with no cookies or personal data collection.
 * Integrates Cloudflare Web Analytics beacon for page views and basic metrics.
 *
 * Setup:
 * 1. Create a Web Analytics site in Cloudflare Dashboard
 * 2. Copy the site token
 * 3. Add to `.env.local`: NEXT_PUBLIC_CF_ANALYTICS_TOKEN=your_token_here
 *
 * Notes:
 * - This component respects Do Not Track (DNT) by not loading the beacon.
 * - The beacon is served via a first-party proxy route (`/beacon.min.js`).
 */

'use client';

import Script from 'next/script';

function isDoNotTrackEnabled(): boolean {
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator as unknown as { doNotTrack?: string; msDoNotTrack?: string })
      : undefined;

  const win =
    typeof window !== 'undefined'
      ? (window as unknown as { doNotTrack?: string })
      : undefined;

  const dnt = nav?.doNotTrack || win?.doNotTrack || nav?.msDoNotTrack;

  return dnt === '1' || dnt === 'yes';
}

export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

  if (isDoNotTrackEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] DNT is enabled; skipping analytics beacon.');
    }
    return null;
  }

  // Skip if no token configured (development/local)
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[Analytics] Cloudflare Web Analytics token not configured. Set NEXT_PUBLIC_CF_ANALYTICS_TOKEN to enable.'
      );
    }
    return null;
  }

  return (
    <Script
      src="/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
      defer
    />
  );
}
