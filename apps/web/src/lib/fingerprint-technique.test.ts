import { describe, expect, it } from 'vitest';
import { getCollectorTechnique } from './fingerprint-technique';

describe('collector technique descriptions', () => {
  it('maps direct camel-case collector keys', () => {
    expect(getCollectorTechnique('screenFrame')?.slug).toBe('screen-frame');
    expect(getCollectorTechnique('serviceWorker')?.description).toMatch(
      /service worker/i
    );
  });

  it('maps collector names that intentionally differ from SEO slugs', () => {
    expect(getCollectorTechnique('clientRects')?.slug).toBe('emoji-rendering');
    expect(getCollectorTechnique('resistance')?.slug).toBe('anti-fingerprint');
  });
});
