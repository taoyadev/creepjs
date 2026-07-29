import { describe, expect, it } from 'vitest';
import { FINGERPRINT_TECHNIQUES, STATIC_SEO_ROUTES } from './seo-routes';
import {
  LLMS_FULL_PATH,
  PRODUCT_IDENTITY_TEXT,
  buildLlmsIndex,
} from './llms-content';

describe('llms navigation index', () => {
  it('lists every non-legal route and every signal mirror exactly once', () => {
    const output = buildLlmsIndex();
    const publicRoutes = STATIC_SEO_ROUTES.filter(
      (route) => route.section !== 'legal'
    );

    for (const route of publicRoutes) {
      expect(output).toContain(`https://creepjs.org${route.path}`);
    }
    for (const signal of FINGERPRINT_TECHNIQUES) {
      expect(
        output
          .split('\n')
          .filter(
            (line) =>
              line ===
              `  - HTML: https://creepjs.org/fingerprint/${signal.slug}`
          )
      ).toHaveLength(1);
      expect(
        output
          .split('\n')
          .filter(
            (line) =>
              line ===
              `  - Markdown: https://creepjs.org/content/fingerprints/${signal.slug}.md`
          )
      ).toHaveLength(1);
    }

    const categories = [
      ...new Set(FINGERPRINT_TECHNIQUES.map((signal) => signal.category)),
    ];
    const groupedSignals = categories.flatMap((category) =>
      FINGERPRINT_TECHNIQUES.filter((signal) => signal.category === category)
    );
    const htmlPositions = groupedSignals.map((signal) =>
      output.indexOf(`- HTML: https://creepjs.org/fingerprint/${signal.slug}`)
    );
    expect(htmlPositions).toEqual([...htmlPositions].sort((a, b) => a - b));

    expect(
      output.match(
        /- Markdown: https:\/\/creepjs\.org\/content\/fingerprints\//g
      )
    ).toHaveLength(FINGERPRINT_TECHNIQUES.length);
    expect(output).toContain(`https://creepjs.org${LLMS_FULL_PATH}`);
  });

  it('states the product identity and ranking restraint', () => {
    const output = buildLlmsIndex();

    expect(output).toContain(PRODUCT_IDENTITY_TEXT);
    expect(output).toContain('Google Search does not use llms.txt');
    expect(output).not.toMatch(/guarantee|improve rankings|citation score/i);
  });
});
