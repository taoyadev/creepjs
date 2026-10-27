/**
 * Product analytics for CreepJS.
 *
 * Events go to our own API (`POST /v1/events`), which stores them in Workers
 * Analytics Engine. The event names, their props and the value rules live in
 * `@creepjs/core/analytics-events`, shared with the API, so a call here that
 * type-checks is one the API accepts.
 *
 * What is sent: the event name, the page path (no query string or fragment)
 * and the event's allowlisted props. Nothing that identifies a person or a
 * device. Nothing is sent under Do Not Track or Global Privacy Control.
 * Page views are counted by Cloudflare Web Analytics' own script.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('tool_run', { tool: 'ip_lookup', surface: 'ip', outcome: 'success' });
 */

import {
  ANALYTICS_EVENTS,
  isValidAnalyticsPropValue,
  normalizeAnalyticsPath,
  type AnalyticsEventName,
  type AnalyticsEventProps,
  type AnalyticsPropName,
} from '@creepjs/core/analytics-events';
import { apiUrl } from '@/lib/api-client';

export type { AnalyticsEventName, AnalyticsEventProps };

const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true';

interface EventPayload {
  name: AnalyticsEventName;
  path: string;
  props: Partial<Record<AnalyticsPropName, string>>;
}

/** Do Not Track or Global Privacy Control. */
function trackingOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  const win = window as Window & { doNotTrack?: string | null };
  return (
    nav.globalPrivacyControl === true ||
    nav.doNotTrack === '1' ||
    win.doNotTrack === '1'
  );
}

/**
 * Keep only the event's allowlisted props whose values pass their rule. The
 * API rejects a bad value outright, so dropping it here keeps the rest of the
 * event.
 */
function allowedProps<N extends AnalyticsEventName>(
  name: N,
  props: AnalyticsEventProps<N>
): EventPayload['props'] {
  const spec = ANALYTICS_EVENTS[name];
  const given = props as Partial<Record<AnalyticsPropName, unknown>>;
  const kept: EventPayload['props'] = {};
  for (const prop of [...spec.required, ...spec.optional]) {
    const value = given[prop];
    if (isValidAnalyticsPropValue(prop, value)) kept[prop] = value;
  }
  return kept;
}

function send(payload: EventPayload): void {
  const url = apiUrl('/v1/events');
  const body = JSON.stringify(payload);

  // A text/plain body is CORS-safelisted, so neither path sends a preflight.
  if (typeof navigator.sendBeacon === 'function') {
    const queued = navigator.sendBeacon(
      url,
      new Blob([body], { type: 'text/plain' })
    );
    if (queued) return;
  }

  void fetch(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'text/plain' },
    keepalive: true,
    credentials: 'omit',
  }).catch(() => {
    // Analytics must never surface an error to the visitor.
  });
}

/**
 * Record a product event. Safe to call during render on the server (it does
 * nothing there) and never throws.
 */
export function trackEvent<N extends AnalyticsEventName>(
  name: N,
  props: AnalyticsEventProps<N>
): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: EventPayload = {
      name,
      path: normalizeAnalyticsPath(window.location.pathname) ?? '/',
      props: allowedProps(name, props),
    };

    if (DEBUG_MODE || process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', payload.name, payload.props);
    }
    // Dev and test builds have no site origin the API accepts.
    if (process.env.NODE_ENV !== 'production') return;
    if (trackingOptedOut()) return;

    send(payload);
  } catch (error) {
    console.warn('[Analytics] Failed to track event:', name, error);
  }
}
