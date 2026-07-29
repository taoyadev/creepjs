import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ScanProgress } from './ScanProgress';

describe('ScanProgress', () => {
  it('renders bounded progress and a polite live status', () => {
    const html = renderToStaticMarkup(
      <ScanProgress
        status="loading"
        progress={{ current: 3, total: 8, currentCollector: 'Canvas complete' }}
        error={null}
        onRetry={() => undefined}
      />
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="3"');
    expect(html).toContain('aria-valuemax="8"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Canvas complete');
  });

  it('renders an alert and retry action after a scan error', () => {
    const html = renderToStaticMarkup(
      <ScanProgress
        status="error"
        progress={{ current: 0, total: 1, currentCollector: '' }}
        error="Collection failed"
        onRetry={() => undefined}
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('Collection failed');
    expect(html).toContain('Try again');
  });
});
