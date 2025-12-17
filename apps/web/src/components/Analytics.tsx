/**
 * Cloudflare Web Analytics Component
 *
 * Privacy-first analytics with no cookies or personal data collection.
 * Integrates Cloudflare Web Analytics beacon for page views and basic metrics.
 *
 * Setup:
 * 1. Create a Web Analytics site in Cloudflare Dashboard
 * 2. Copy the site token
 * 3. Add to .env.local: NEXT_PUBLIC_CF_ANALYTICS_TOKEN=your_token_here
 *
 * Features:
 * - No cookies
 * - GDPR/CCPA compliant
 * - No personal data collection
 * - Real-time dashboard
 * - Page views, referrers, devices, browsers
 */

import Script from 'next/script';

export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

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
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
      defer
    />
  );
}

/**
 * Custom Event Tracker for Cloudflare Web Analytics
 *
 * Track custom events beyond page views. Useful for tracking user interactions.
 *
 * Usage:
 *   trackAnalyticsEvent('fingerprint_generated', { confidence: 0.95 });
 */
export function trackAnalyticsEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  // Check if Cloudflare Analytics is available
  if (typeof window !== 'undefined' && (window as any).__cfBeacon) {
    try {
      // Cloudflare Web Analytics supports custom events via JavaScript
      // Note: Custom events may require Cloudflare Business plan or higher
      (window as any).__cfBeacon('track', eventName, properties);
    } catch (error) {
      console.warn('[Analytics] Failed to track event:', eventName, error);
    }
  }
}

/**
 * Track page view manually (usually automatic with beacon)
 */
export function trackPageView(url?: string) {
  if (typeof window !== 'undefined' && (window as any).__cfBeacon) {
    try {
      (window as any).__cfBeacon('trackPageview', {
        url: url || window.location.href,
      });
    } catch (error) {
      console.warn('[Analytics] Failed to track page view:', error);
    }
  }
}
