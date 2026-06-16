import { describe, expect, it } from 'vitest';
import {
  collectorTabs,
  getCollectorLabel,
  getCollectorsForTab,
} from '../src/sources/manifest';

describe('collector manifest', () => {
  it('exposes the expected shared checker tabs', () => {
    expect(collectorTabs.map((tab) => tab.key)).toEqual([
      'all',
      'graphics',
      'system',
      'media',
      'network',
      'security',
      'accessibility',
    ]);
  });

  it('resolves friendly collector labels', () => {
    expect(getCollectorLabel('screenResolution')).toBe('Screen Resolution');
    expect(getCollectorLabel('nonexistent')).toBe('nonexistent');
  });

  it('returns manifest-backed collectors for checker tabs', () => {
    expect(getCollectorsForTab('graphics').map((entry) => entry.key)).toEqual([
      'canvas',
      'webgl',
      'svg',
      'css',
      'textMetrics',
    ]);

    expect(getCollectorsForTab('network').map((entry) => entry.key)).toEqual([
      'mimeTypes',
      'contentWindow',
      'cssMedia',
      'webrtc',
      'serviceWorker',
    ]);
  });
});
