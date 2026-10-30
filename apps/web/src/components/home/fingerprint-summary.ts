import type { FingerprintData, FingerprintResult } from '@creepjs/core';

/**
 * Homepage reading of a completed scan. Type-only imports keep the collectors
 * out of the homepage's initial chunks.
 */
export interface SignalRow {
  key: string;
  label: string;
  /** Collectors that have to finish before the row's value exists. */
  collectors: readonly string[];
  /** The observed value, or `null` when the browser returned nothing usable. */
  read: (data: FingerprintData) => string | null;
}

const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg(?:e|A|iOS)?\/(\d+)/, 'Edge'],
  [/(?:OPR|Opera)\/(\d+)/, 'Opera'],
  [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
  [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
  [/HeadlessChrome\/(\d+)/, 'Headless Chrome'],
  [/Chromium\/(\d+)/, 'Chromium'],
  [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
  [/Version\/(\d+)[\d.]* (?:Mobile\/\S+ )?Safari\//, 'Safari'],
];

const SYSTEMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Windows NT/, 'Windows'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
];

/** What the user agent string claims, e.g. "Chrome 141 on macOS". */
export function describeUserAgent(
  userAgent: string | undefined
): string | null {
  if (!userAgent) return null;
  let browser: string | null = null;
  for (const [pattern, name] of BROWSERS) {
    const version = pattern.exec(userAgent)?.[1];
    if (version) {
      browser = `${name} ${version}`;
      break;
    }
  }
  const system =
    SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system;
}

/**
 * Chromium reports WebGL renderers through ANGLE, for example
 * "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)". Keep
 * the device name from that wrapper; other strings pass through unchanged.
 * The raw value stays in the collected JSON and the full report.
 */
export function describeRenderer(renderer: string | undefined): string | null {
  if (!renderer) return null;
  const parts = /^ANGLE \((.*)\)$/.exec(renderer)?.[1]?.split(', ');
  if (!parts || parts.length < 3) return renderer;
  const device = parts
    .slice(1, -1)
    .join(', ')
    .replace(/^ANGLE \w+ Renderer: /, '')
    .replace(/ \(0x[\da-f]+\)/gi, '')
    .replace(/ Direct3D.*$/, '')
    .trim();
  return device || renderer;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

function describeLanguages(languages: FingerprintData['languages']) {
  const unique = [...new Set(languages?.flat().filter(Boolean) ?? [])];
  if (unique.length === 0) return null;
  const rest = unique.length - 3;
  return unique.slice(0, 3).join(', ') + (rest > 0 ? ` +${rest}` : '');
}

export const SIGNAL_ROWS: readonly SignalRow[] = [
  {
    key: 'browser',
    label: 'User agent',
    collectors: ['navigator'],
    read: ({ navigator: nav }) =>
      describeUserAgent(nav?.userAgent) ?? (nav?.userAgent || null),
  },
  {
    key: 'graphics',
    label: 'Graphics',
    collectors: ['webgl'],
    read: ({ webgl }) =>
      describeRenderer(webgl?.unmaskedRenderer || webgl?.renderer),
  },
  {
    key: 'screen',
    label: 'Screen',
    collectors: ['screen'],
    read: ({ screen: display }) =>
      display
        ? `${display.width} × ${display.height}, ${Number(display.devicePixelRatio.toFixed(2))}x pixel ratio`
        : null,
  },
  {
    key: 'hardware',
    label: 'Reported hardware',
    collectors: ['hardwareConcurrency', 'deviceMemory'],
    read: ({ hardwareConcurrency, deviceMemory }) =>
      [
        hardwareConcurrency == null
          ? null
          : plural(hardwareConcurrency, 'logical core', 'logical cores'),
        deviceMemory == null ? null : `${deviceMemory} GB memory`,
      ]
        .filter(Boolean)
        .join(', ') || null,
  },
  {
    key: 'timezone',
    label: 'Time zone',
    collectors: ['timezone'],
    read: ({ timezone }) => timezone?.timezone || null,
  },
  {
    key: 'languages',
    label: 'Languages',
    collectors: ['languages'],
    read: ({ languages }) => describeLanguages(languages),
  },
  {
    key: 'webrtc',
    label: 'WebRTC',
    collectors: ['webrtc'],
    read: ({ webrtc }) => {
      if (!webrtc) return null;
      if (!webrtc.supported) return 'Not supported';
      // `local` holds every gathered ICE candidate; `public` the public IPv4s.
      if (webrtc.candidates.local.length === 0)
        return 'No network addresses gathered';
      const exposed = webrtc.candidates.public.length;
      return exposed > 0
        ? `Reveals ${plural(exposed, 'public IP', 'public IPs')}`
        : 'No public IP revealed';
    },
  },
  {
    key: 'consistency',
    label: 'Consistency',
    collectors: ['lies'],
    read: ({ lies }) => {
      if (!lies) return null;
      return lies.liesCount === 0
        ? 'No inconsistencies observed'
        : `${plural(lies.liesCount, 'inconsistency', 'inconsistencies')} observed`;
    },
  },
];

export function formatDuration(milliseconds: number | undefined): string {
  const value = milliseconds ?? 0;
  const rounded = Math.round(value);
  return rounded < 1000 ? `${rounded} ms` : `${(value / 1000).toFixed(1)} s`;
}

/**
 * Headline for a finished scan. Unavailable APIs are normal differences
 * between browsers, so only failed checks qualify the result.
 */
export function describeScanHeadline(result: FingerprintResult): string {
  const { successful, failed } = result.coverage;
  if (successful === 0) return 'No values returned';
  return failed > 0 ? 'Scan finished with failed checks' : 'Scan complete';
}

export function describeCoverage(result: FingerprintResult): string {
  const { successful, failed, skipped } = result.coverage;
  const total = successful + failed + skipped;
  const time = formatDuration(result.timings.total);
  if (successful === 0)
    return `None of the ${total} checks returned a value. A browser setting or extension may block these APIs.`;
  if (successful === total)
    return `All ${total} checks returned values in ${time}.`;
  const gaps = [
    failed > 0 ? `${failed} failed` : null,
    skipped > 0
      ? `${skipped} ${skipped === 1 ? 'is' : 'are'} not available in this browser`
      : null,
  ]
    .filter(Boolean)
    .join(' and ');
  return `${successful} of ${total} checks returned values in ${time}. ${gaps}.`;
}

export interface GlyphRing {
  radius: number;
  /** SVG stroke-dasharray: one dash and one gap that repeat around the ring. */
  dash: string;
  rotation: number;
}

const GLYPH_RADII = [10, 15, 20, 25, 30, 35] as const;

/**
 * Concentric arcs drawn from the characters of a fingerprint ID, so one ID
 * always produces the same mark. Without an ID every ring gets the same
 * neutral arc, which the scan animation turns while collectors run.
 */
export function fingerprintGlyph(id: string | null): GlyphRing[] {
  return GLYPH_RADII.map((radius, index) => {
    const circumference = 2 * Math.PI * radius;
    if (!id) {
      return {
        radius,
        dash: `${(circumference * 0.62).toFixed(2)} ${(circumference * 0.38).toFixed(2)}`,
        rotation: index * 47,
      };
    }
    const code = (offset: number) =>
      id.charCodeAt((index * 3 + offset) % id.length);
    const segments = 1 + (code(0) % 3);
    const filled = 0.45 + ((code(1) * 7) % 41) / 100;
    const dash = (circumference * filled) / segments;
    const gap = (circumference * (1 - filled)) / segments;
    return {
      radius,
      dash: `${dash.toFixed(2)} ${gap.toFixed(2)}`,
      rotation: (code(2) * 29) % 360,
    };
  });
}
