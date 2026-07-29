import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CheckerApp rendering boundary', () => {
  it('contains lazy report panels inside a stable local suspense fallback', () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src',
        'components',
        'checker',
        'CheckerApp.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('<Suspense fallback={<ReportLoadingFallback />}>');
    expect(source).toContain('aria-label="Preparing fingerprint report"');
    expect(source.indexOf('<Suspense')).toBeLessThan(
      source.indexOf('<ConfidenceDashboard')
    );
  });
});
