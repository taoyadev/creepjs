export interface CollectorManifestEntry {
  key: string;
  label: string;
  category:
    | 'graphics'
    | 'hardware'
    | 'browser'
    | 'system'
    | 'audio'
    | 'accessibility'
    | 'privacy'
    | 'network';
  tabs?: readonly CollectorTabKey[];
}

export type CollectorTabKey =
  | 'all'
  | 'graphics'
  | 'system'
  | 'media'
  | 'network'
  | 'security'
  | 'accessibility';

export interface CollectorTabDefinition {
  key: CollectorTabKey;
  label: string;
}

export const collectorTabs: readonly CollectorTabDefinition[] = [
  { key: 'all', label: 'All' },
  { key: 'graphics', label: 'Graphics' },
  { key: 'system', label: 'System' },
  { key: 'media', label: 'Media' },
  { key: 'network', label: 'Network' },
  { key: 'security', label: 'Security' },
  { key: 'accessibility', label: 'Accessibility' },
] as const;

export const collectorManifest: readonly CollectorManifestEntry[] = [
  { key: 'canvas', label: 'Canvas', category: 'graphics', tabs: ['graphics'] },
  { key: 'webgl', label: 'WebGL', category: 'graphics', tabs: ['graphics'] },
  {
    key: 'navigator',
    label: 'Navigator',
    category: 'browser',
    tabs: ['system'],
  },
  { key: 'screen', label: 'Screen', category: 'hardware', tabs: ['system'] },
  { key: 'screenFrame', label: 'Screen Frame', category: 'hardware' },
  {
    key: 'screenResolution',
    label: 'Screen Resolution',
    category: 'hardware',
  },
  { key: 'colorDepth', label: 'Color Depth', category: 'hardware' },
  { key: 'fonts', label: 'Fonts', category: 'system', tabs: ['system'] },
  { key: 'languages', label: 'Languages', category: 'browser' },
  {
    key: 'timezone',
    label: 'Timezone',
    category: 'system',
    tabs: ['security'],
  },
  { key: 'dateTimeLocale', label: 'Date/Time Locale', category: 'system' },
  { key: 'audio', label: 'Audio Context', category: 'audio', tabs: ['media'] },
  { key: 'media', label: 'Media Devices', category: 'audio', tabs: ['media'] },
  {
    key: 'clientRects',
    label: 'Emoji Rendering',
    category: 'graphics',
    tabs: ['media'],
  },
  { key: 'voices', label: 'Speech Voices', category: 'audio', tabs: ['media'] },
  {
    key: 'svg',
    label: 'SVG Rendering',
    category: 'graphics',
    tabs: ['graphics'],
  },
  {
    key: 'math',
    label: 'Math Precision',
    category: 'system',
    tabs: ['system'],
  },
  { key: 'css', label: 'CSS Styles', category: 'graphics', tabs: ['graphics'] },
  {
    key: 'textMetrics',
    label: 'Text Metrics',
    category: 'graphics',
    tabs: ['graphics'],
  },
  {
    key: 'htmlElement',
    label: 'HTML Element',
    category: 'browser',
    tabs: ['system'],
  },
  {
    key: 'consoleErrors',
    label: 'Console Errors',
    category: 'system',
    tabs: ['security'],
  },
  {
    key: 'domRect',
    label: 'DOM Rectangle',
    category: 'browser',
    tabs: ['media'],
  },
  {
    key: 'mimeTypes',
    label: 'MIME Types',
    category: 'browser',
    tabs: ['network'],
  },
  {
    key: 'plugins',
    label: 'Plugins',
    category: 'browser',
  },
  {
    key: 'resistance',
    label: 'Anti-Fingerprinting Detection',
    category: 'privacy',
    tabs: ['security'],
  },
  {
    key: 'contentWindow',
    label: 'Content Window',
    category: 'browser',
    tabs: ['network'],
  },
  {
    key: 'cssMedia',
    label: 'CSS Media Queries',
    category: 'browser',
    tabs: ['network'],
  },
  { key: 'webrtc', label: 'WebRTC', category: 'network', tabs: ['network'] },
  {
    key: 'serviceWorker',
    label: 'Service Worker',
    category: 'network',
    tabs: ['network'],
  },
  { key: 'domBlockers', label: 'Privacy / Ad Blockers', category: 'privacy' },
  {
    key: 'fontPreferences',
    label: 'Font Preferences',
    category: 'system',
  },
  {
    key: 'colorGamut',
    label: 'Color Gamut',
    category: 'hardware',
    tabs: ['accessibility'],
  },
  {
    key: 'invertedColors',
    label: 'Inverted Colors',
    category: 'accessibility',
  },
  {
    key: 'contrast',
    label: 'Contrast',
    category: 'accessibility',
    tabs: ['accessibility'],
  },
  {
    key: 'forcedColors',
    label: 'Forced Colors',
    category: 'accessibility',
    tabs: ['accessibility'],
  },
  {
    key: 'monochrome',
    label: 'Monochrome Display',
    category: 'hardware',
    tabs: ['accessibility'],
  },
  {
    key: 'reducedMotion',
    label: 'Reduced Motion',
    category: 'accessibility',
    tabs: ['accessibility'],
  },
  {
    key: 'reducedTransparency',
    label: 'Reduced Transparency',
    category: 'accessibility',
    tabs: ['accessibility'],
  },
  {
    key: 'hdr',
    label: 'HDR Support',
    category: 'hardware',
    tabs: ['accessibility'],
  },
  {
    key: 'audioBaseLatency',
    label: 'Audio Base Latency',
    category: 'audio',
    tabs: ['accessibility'],
  },
  {
    key: 'applePay',
    label: 'Apple Pay',
    category: 'browser',
    tabs: ['accessibility'],
  },
  { key: 'deviceMemory', label: 'Device Memory', category: 'hardware' },
  {
    key: 'hardwareConcurrency',
    label: 'Hardware Concurrency',
    category: 'hardware',
  },
  { key: 'osCpu', label: 'OS CPU', category: 'system' },
  { key: 'cpuClass', label: 'CPU Class', category: 'system' },
  { key: 'platform', label: 'Platform', category: 'browser' },
  { key: 'vendor', label: 'Vendor', category: 'browser' },
  { key: 'vendorFlavors', label: 'Vendor Flavors', category: 'browser' },
  {
    key: 'sessionStorage',
    label: 'Session Storage',
    category: 'browser',
  },
  { key: 'localStorage', label: 'Local Storage', category: 'browser' },
  { key: 'indexedDB', label: 'IndexedDB', category: 'browser' },
  { key: 'openDatabase', label: 'Open Database', category: 'browser' },
  { key: 'touchSupport', label: 'Touch Support', category: 'hardware' },
  { key: 'cookiesEnabled', label: 'Cookies Enabled', category: 'browser' },
  { key: 'pdfViewerEnabled', label: 'PDF Viewer', category: 'browser' },
  {
    key: 'architecture',
    label: 'CPU Architecture',
    category: 'system',
  },
  {
    key: 'privateClickMeasurement',
    label: 'Private Click Measurement',
    category: 'privacy',
  },
  {
    key: 'accessibilityPreferences',
    label: 'Accessibility & Preferences',
    category: 'accessibility',
    tabs: ['accessibility'],
  },
  {
    key: 'lies',
    label: 'Lies Detection',
    category: 'privacy',
    tabs: ['security'],
  },
] as const;

const collectorManifestMap = new Map(
  collectorManifest.map((entry) => [entry.key, entry])
);

export function getCollectorManifestEntry(key: string) {
  return collectorManifestMap.get(key);
}

export function getCollectorLabel(key: string) {
  return getCollectorManifestEntry(key)?.label ?? key;
}

export function getCollectorsForTab(tab: CollectorTabKey) {
  return collectorManifest.filter((entry) => entry.tabs?.includes(tab));
}
