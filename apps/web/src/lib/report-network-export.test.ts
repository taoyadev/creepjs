import { describe, expect, it } from 'vitest';
import {
  buildNetworkCsvRows,
  buildNetworkExportSummary,
} from './report-network-export';

describe('network report export', () => {
  it('preserves geo-only context without inventing a risk score', () => {
    const input = {
      ip: '203.0.113.8',
      location: { country_code: 'US', city: 'Example' },
      asn: { number: 64500, organization: 'Example Net' },
    };

    expect(buildNetworkExportSummary(input)).toMatchObject({
      ip: '203.0.113.8',
      risk: null,
      riskEnrichmentAvailable: false,
    });
    expect(buildNetworkCsvRows(input)).toContainEqual([
      'Network Trust',
      'Risk Band',
      'Geo only',
    ]);
    expect(buildNetworkCsvRows(input)).toContainEqual([
      'Network Trust',
      'Risk Score',
      'N/A',
    ]);
  });
});
