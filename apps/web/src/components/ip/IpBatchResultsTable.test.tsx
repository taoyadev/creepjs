import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IpBatchResultsTable } from './IpBatchResultsTable';
import type { IpBatchResponse } from '@/lib/ip-batch';

const response: IpBatchResponse = {
  count: 3,
  submittedCount: 3,
  uniqueCount: 3,
  validCount: 2,
  successCount: 1,
  invalidCount: 1,
  failedCount: 2,
  skippedCount: 1,
  cachedCount: 0,
  highRiskCount: 0,
  quotaCost: 2,
  aborted: true,
  results: [
    {
      ip: '8.8.8.8',
      ok: true,
      outcome: 'success',
      cached: false,
      highRisk: false,
      data: { ip: '8.8.8.8' },
    },
    {
      ip: 'bad-value',
      ok: false,
      outcome: 'invalid',
      status: 400,
      error: 'Invalid IP address',
    },
    {
      ip: '1.1.1.1',
      ok: false,
      outcome: 'skipped',
      error: 'Skipped after a dependency failure',
    },
  ],
};

describe('IpBatchResultsTable', () => {
  it('renders semantic headers, row headers, and explicit outcome text', () => {
    const html = renderToStaticMarkup(
      <IpBatchResultsTable response={response} labelledBy="batch-results" />
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-labelledby="batch-results"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('<caption');
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain('Success');
    expect(html).toContain('Invalid');
    expect(html).toContain('Skipped');
    expect(html).toContain('data-outcome="skipped"');
    expect(html).toContain('overflow-x-auto');
  });
});
