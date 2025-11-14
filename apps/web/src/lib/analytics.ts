/**
 * Analytics Utilities for CreepJS
 *
 * Centralized analytics tracking with type-safe event definitions.
 * Supports Cloudflare Web Analytics and can be extended for other providers.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics';
 *   analytics.track.fingerprintGenerated({ confidence: 0.95, method: 'canvas' });
 */

// ============================================================================
// Event Type Definitions
// ============================================================================

/**
 * All trackable events in the application
 */
export type AnalyticsEvent =
  // Fingerprinting Events
  | 'fingerprint_generated'
  | 'fingerprint_copied'
  | 'fingerprint_compared'
  | 'fingerprint_exported'
  // API Events
  | 'api_token_requested'
  | 'api_call_made'
  | 'api_error'
  // User Journey Events
  | 'page_view'
  | 'demo_started'
  | 'docs_viewed'
  | 'playground_used'
  // Engagement Events
  | 'button_clicked'
  | 'link_clicked'
  | 'form_submitted'
  | 'search_performed'
  // Technical Events
  | 'collector_tested'
  | 'sdk_loaded'
  | 'error_occurred';

/**
 * Properties that can be attached to events
 */
export interface AnalyticsProperties {
  // Common properties
  page?: string;
  section?: string;
  label?: string;
  value?: number;

  // Fingerprinting specific
  confidence?: number;
  method?: string;
  collectorType?: string;
  fingerprintId?: string;

  // API specific
  endpoint?: string;
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;

  // User interaction
  buttonLabel?: string;
  linkUrl?: string;
  formName?: string;
  searchQuery?: string;

  // Custom properties
  [key: string]: any;
}

// ============================================================================
// Analytics Configuration
// ============================================================================

const IS_BROWSER = typeof window !== 'undefined';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true';

/**
 * Check if analytics is available
 */
function isAnalyticsAvailable(): boolean {
  return IS_BROWSER && !!(window as any).__cfBeacon;
}

/**
 * Log analytics events in development/debug mode
 */
function debugLog(eventName: string, properties?: AnalyticsProperties) {
  if (DEBUG_MODE || !IS_PRODUCTION) {
    console.log('[Analytics]', eventName, properties || '(no properties)');
  }
}

// ============================================================================
// Core Tracking Functions
// ============================================================================

/**
 * Track a custom event
 *
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 */
export function trackEvent(
  eventName: AnalyticsEvent,
  properties?: AnalyticsProperties
) {
  debugLog(eventName, properties);

  if (!isAnalyticsAvailable()) {
    return;
  }

  try {
    (window as any).__cfBeacon('track', eventName, properties);
  } catch (error) {
    console.warn('[Analytics] Failed to track event:', eventName, error);
  }
}

/**
 * Track a page view
 *
 * @param url - Optional URL to track (defaults to current URL)
 */
export function trackPageView(url?: string) {
  const pageUrl = url || (IS_BROWSER ? window.location.href : '/');

  debugLog('page_view', { page: pageUrl });

  if (!isAnalyticsAvailable()) {
    return;
  }

  try {
    (window as any).__cfBeacon('trackPageview', { url: pageUrl });
  } catch (error) {
    console.warn('[Analytics] Failed to track page view:', error);
  }
}

/**
 * Track an error
 *
 * @param error - Error object or message
 * @param context - Additional context about the error
 */
export function trackError(
  error: Error | string,
  context?: AnalyticsProperties
) {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  trackEvent('error_occurred', {
    errorMessage,
    errorStack,
    ...context,
  });
}

// ============================================================================
// High-Level Tracking API
// ============================================================================

/**
 * Organized analytics tracking functions by category
 */
export const analytics = {
  /**
   * Track fingerprinting-related events
   */
  track: {
    /**
     * Track when a fingerprint is generated
     */
    fingerprintGenerated: (props: {
      confidence: number;
      method?: string;
      fingerprintId?: string;
    }) => {
      trackEvent('fingerprint_generated', props);
    },

    /**
     * Track when a fingerprint is copied to clipboard
     */
    fingerprintCopied: (props?: { fingerprintId?: string }) => {
      trackEvent('fingerprint_copied', props);
    },

    /**
     * Track when fingerprints are compared
     */
    fingerprintCompared: (props?: { count?: number }) => {
      trackEvent('fingerprint_compared', props);
    },

    /**
     * Track when a fingerprint is exported
     */
    fingerprintExported: (props: {
      format: string;
      fingerprintId?: string;
    }) => {
      trackEvent('fingerprint_exported', props);
    },

    /**
     * Track API token requests
     */
    apiTokenRequested: (props?: { email?: string }) => {
      trackEvent('api_token_requested', props);
    },

    /**
     * Track API calls
     */
    apiCallMade: (props: {
      endpoint: string;
      statusCode?: number;
      responseTime?: number;
    }) => {
      trackEvent('api_call_made', props);
    },

    /**
     * Track API errors
     */
    apiError: (props: {
      endpoint: string;
      statusCode: number;
      errorMessage?: string;
    }) => {
      trackEvent('api_error', props);
    },

    /**
     * Track when demo is started
     */
    demoStarted: (props?: { page?: string }) => {
      trackEvent('demo_started', props);
    },

    /**
     * Track when documentation is viewed
     */
    docsViewed: (props?: { section?: string }) => {
      trackEvent('docs_viewed', props);
    },

    /**
     * Track when playground is used
     */
    playgroundUsed: (props?: { endpoint?: string }) => {
      trackEvent('playground_used', props);
    },

    /**
     * Track when a specific collector is tested
     */
    collectorTested: (props: {
      collectorType: string;
      result?: 'success' | 'error';
    }) => {
      trackEvent('collector_tested', props);
    },

    /**
     * Track button clicks
     */
    buttonClicked: (props: { buttonLabel: string; section?: string }) => {
      trackEvent('button_clicked', props);
    },

    /**
     * Track link clicks
     */
    linkClicked: (props: { linkUrl: string; label?: string }) => {
      trackEvent('link_clicked', props);
    },

    /**
     * Track form submissions
     */
    formSubmitted: (props: { formName: string; success: boolean }) => {
      trackEvent('form_submitted', props);
    },

    /**
     * Track search queries
     */
    searchPerformed: (props: {
      searchQuery: string;
      resultsCount?: number;
    }) => {
      trackEvent('search_performed', props);
    },

    /**
     * Track when SDK is loaded
     */
    sdkLoaded: (props?: { version?: string }) => {
      trackEvent('sdk_loaded', props);
    },
  },

  /**
   * Track page views
   */
  pageView: trackPageView,

  /**
   * Track errors
   */
  error: trackError,

  /**
   * Check if analytics is available
   */
  isAvailable: isAnalyticsAvailable,

  /**
   * Get analytics configuration
   */
  config: {
    isProduction: IS_PRODUCTION,
    debugMode: DEBUG_MODE,
    isAvailable: isAnalyticsAvailable(),
  },
};

// ============================================================================
// React Hooks (optional)
// ============================================================================

/**
 * Hook to track page views automatically
 * Use in layout or page components
 */
export function usePageTracking(pageName?: string) {
  if (IS_BROWSER) {
    // Track page view on mount
    const url = pageName || window.location.pathname;
    analytics.pageView(url);
  }
}

/**
 * Hook to track events with React
 * Returns a memoized track function
 */
export function useAnalytics() {
  return analytics;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Measure execution time and track as analytics event
 *
 * Usage:
 *   const end = measureTime();
 *   // ... do something
 *   end('fingerprint_generated', { method: 'canvas' });
 */
export function measureTime() {
  const startTime = performance.now();

  return (eventName: AnalyticsEvent, properties?: AnalyticsProperties) => {
    const duration = performance.now() - startTime;
    trackEvent(eventName, {
      ...properties,
      duration: Math.round(duration),
    });
  };
}

/**
 * Track promises with success/error events
 *
 * Usage:
 *   await trackPromise(
 *     fetchData(),
 *     'api_call_made',
 *     { endpoint: '/v1/fingerprint' }
 *   );
 */
export async function trackPromise<T>(
  promise: Promise<T>,
  successEvent: AnalyticsEvent,
  properties?: AnalyticsProperties
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await promise;
    const duration = performance.now() - startTime;

    trackEvent(successEvent, {
      ...properties,
      duration: Math.round(duration),
      result: 'success',
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackEvent('error_occurred', {
      ...properties,
      duration: Math.round(duration),
      result: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
