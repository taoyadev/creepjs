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

  it('reserves a full viewport for the report before the first scan finishes', () => {
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
    const pending = source.slice(
      source.indexOf('if (!fingerprint) {'),
      source.indexOf('const shareUrl')
    );

    expect(pending).toContain('min-h-[100svh]');
    expect(pending).toContain("status !== 'error'");
    expect(pending).toContain('<ScanProgress');
  });
});
