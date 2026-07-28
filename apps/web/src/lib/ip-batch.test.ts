import { describe, expect, it } from 'vitest';
import {
  buildIpBatchCsv,
  parseIpBatchInput,
  validateIpBatchInput,
  type IpBatchResponse,
} from './ip-batch';

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
  highRiskCount: 1,
  quotaCost: 2,
  aborted: true,
  abortedReason: 'provider-unavailable',
  results: [
    {
      ip: '2001:db8::1',
      ok: true,
      outcome: 'success',
      cached: false,
      highRisk: true,
      data: {
        ip: '2001:db8::1',
        score: {
          risk_score: 75,
          band: '-high',
          verdict: '=review',
        },
        location: {
          country_code: 'US',
          region: 'West, Coast',
          city: 'Quote "City"',
        },
        network: { asn: 'AS64500', org: '+Example Networks' },
      },
    },
    {
      ip: '=not-an-ip',
      ok: false,
      outcome: 'invalid',
      status: 400,
      error: '@invalid input',
    },
    {
      ip: '1.1.1.1',
      ok: false,
      outcome: 'skipped',
      error: 'Skipped after a dependency failure',
    },
  ],
};

describe('IP batch input', () => {
  it('splits commas and whitespace without splitting IPv6 colons', () => {
    const parsed = parseIpBatchInput(
      '8.8.8.8, 2001:db8::1\n::1\t8.8.8.8'
    );

    expect(parsed.entries).toEqual([
      '8.8.8.8',
      '2001:db8::1',
      '::1',
      '8.8.8.8',
    ]);
    expect(parsed.uniqueCount).toBe(3);
    expect(parsed.duplicateCount).toBe(1);
  });

  it('enforces token, item-count, and item-length boundaries', () => {
    expect(validateIpBatchInput(parseIpBatchInput(''), false)).toEqual([
      'Enter an API token.',
      'Enter at least one IPv4 or IPv6 address.',
    ]);

    const fifty = parseIpBatchInput(
      Array.from({ length: 50 }, (_, index) => `10.0.0.${index}`).join(' ')
    );
    expect(validateIpBatchInput(fifty, true)).toEqual([]);

    const fiftyOne = parseIpBatchInput(
      Array.from({ length: 51 }, (_, index) => `10.0.0.${index}`).join(' ')
    );
    expect(validateIpBatchInput(fiftyOne, true)).toContain(
      'Enter at most 50 addresses per batch.'
    );
    expect(
      validateIpBatchInput(parseIpBatchInput('x'.repeat(46)), true)
    ).toContain('Each address must be 45 characters or fewer.');
  });
});

describe('IP batch CSV', () => {
  it('exports success, invalid, and skipped rows in fixed order', () => {
    const csv = buildIpBatchCsv(response);
    const lines = csv.split('\r\n');

    expect(lines[0]).toContain('"ip","status","http_status"');
    expect(lines).toHaveLength(5); // header + three rows + trailing CRLF
    expect(lines[1]).toContain('"2001:db8::1","success"');
    expect(lines[2]).toContain(`"'=not-an-ip","invalid","400"`);
    expect(lines[3]).toContain('"1.1.1.1","skipped"');
  });

  it('uses RFC 4180 escaping and neutralizes every formula trigger', () => {
    const csv = buildIpBatchCsv(response);

    expect(csv).toContain(`"West, Coast"`);
    expect(csv).toContain(`"Quote ""City"""`);
    expect(csv).toContain(`"'-high"`);
    expect(csv).toContain(`"'=review"`);
    expect(csv).toContain(`"'+Example Networks"`);
    expect(csv).toContain(`"'@invalid input"`);
    expect(csv).not.toContain('cfp_do_not_export');
  });
});
