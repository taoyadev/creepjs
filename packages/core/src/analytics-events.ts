/**
 * Product analytics allowlist, shared by the site (which sends events) and the
 * API (which validates and stores them in Workers Analytics Engine). This is
 * the only place event names and props are defined: the API builds its schema
 * from it and the web derives its types from it, so the two cannot drift.
 *
 * Imported as `@creepjs/core/analytics-events`, outside the main entry point,
 * so the SDK bundle and pages that only track events do not pull in the
 * collectors.
 *
 * Every value is stored, so each one must stay low-cardinality and must never
 * identify a person or a device: no IPs, user agents, fingerprint IDs, tokens,
 * emails or free text.
 */

/** Lowercase slug, at most 48 characters: `surface`, `section` and `label`. */
export const ANALYTICS_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;

/** HTTP status of the tool's API call, or `0` when no response arrived. */
export const ANALYTICS_STATUS_PATTERN = /^(?:0|[1-5][0-9]{2})$/;

/** Longest page path kept after normalisation. */
export const ANALYTICS_MAX_PATH_LENGTH = 128;

/**
 * Value rule per prop: a list is an enum, `slug` and `status` are the patterns
 * above. A prop means the same thing in every event that allows it.
 */
export const ANALYTICS_PROP_RULES = {
  tool: ['fingerprint_scan', 'ip_lookup', 'api_request'],
  surface: 'slug',
  outcome: ['success', 'error'],
  status: 'status',
  section: 'slug',
  label: 'slug',
} as const;

export type AnalyticsPropName = keyof typeof ANALYTICS_PROP_RULES;

/**
 * Analytics Engine blob order for props. `blob1` is the event name, `blob2`
 * the page path, and these follow from `blob3`. A prop keeps its column in
 * every event and an absent prop is stored as `''`. Append only: reordering
 * changes the meaning of stored rows.
 */
export const ANALYTICS_PROP_COLUMNS = [
  'tool', // blob3
  'surface', // blob4
  'outcome', // blob5
  'status', // blob6
  'section', // blob7
  'label', // blob8
] as const satisfies readonly AnalyticsPropName[];

interface AnalyticsEventSpec {
  required: readonly AnalyticsPropName[];
  optional: readonly AnalyticsPropName[];
}

export const ANALYTICS_EVENTS = {
  /**
   * A tool finished, successfully or not. The north-star unit: a checker
   * scan, an IP lookup, or a playground API request.
   */
  tool_run: { required: ['tool', 'surface', 'outcome'], optional: ['status'] },
  /** The playground asked the API for a token. */
  api_token_requested: { required: ['surface', 'outcome'], optional: [] },
  /** A docs tab was opened (or the default tab was shown). */
  docs_viewed: { required: ['section'], optional: [] },
  /** A tracked button or button-styled CTA was clicked. */
  button_clicked: { required: ['label'], optional: ['section'] },
  /** Half a partner card became visible, once per page/provider/placement. */
  partner_impression: { required: ['label', 'section'], optional: [] },
  /** A tracked text link was clicked. */
  link_clicked: { required: ['label'], optional: ['section'] },
  /** A fingerprint ID was copied. The ID itself is never sent. */
  fingerprint_copied: { required: ['surface'], optional: [] },
} as const satisfies Record<string, AnalyticsEventSpec>;

export type AnalyticsEventName = keyof typeof ANALYTICS_EVENTS;

export const ANALYTICS_EVENT_NAMES = Object.keys(
  ANALYTICS_EVENTS
) as AnalyticsEventName[];

type AnalyticsPropValue<P extends AnalyticsPropName> =
  (typeof ANALYTICS_PROP_RULES)[P] extends ReadonlyArray<infer V> ? V : string;

type RequiredProps<N extends AnalyticsEventName> =
  (typeof ANALYTICS_EVENTS)[N]['required'][number];
type OptionalProps<N extends AnalyticsEventName> =
  (typeof ANALYTICS_EVENTS)[N]['optional'][number];

/** Props an event accepts, with enum props narrowed to their values. */
export type AnalyticsEventProps<N extends AnalyticsEventName> = {
  [P in RequiredProps<N>]: AnalyticsPropValue<P>;
} & {
  [P in OptionalProps<N>]?: AnalyticsPropValue<P>;
};

export function isAnalyticsEventName(
  value: unknown
): value is AnalyticsEventName {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ANALYTICS_EVENTS, value)
  );
}

/** Whether `value` satisfies `prop`'s rule. */
export function isValidAnalyticsPropValue(
  prop: AnalyticsPropName,
  value: unknown
): value is string {
  if (typeof value !== 'string') return false;
  const rule = ANALYTICS_PROP_RULES[prop];
  if (rule === 'slug') return ANALYTICS_SLUG_PATTERN.test(value);
  if (rule === 'status') return ANALYTICS_STATUS_PATTERN.test(value);
  return (rule as readonly string[]).includes(value);
}

/**
 * Reduce a URL or path to its pathname: no origin, query string or fragment,
 * so `?q=<ip>` or `#token` never reaches storage. Returns null when the input
 * cannot be parsed or the pathname is longer than the cap.
 */
export function normalizeAnalyticsPath(value: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(value, 'https://creepjs.org').pathname;
  } catch {
    return null;
  }
  return pathname.length <= ANALYTICS_MAX_PATH_LENGTH ? pathname : null;
}
