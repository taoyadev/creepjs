import { describe, it, expect } from 'vitest';
import { visitorQuotaSubject } from '../src/utils/counters';

describe('visitorQuotaSubject', () => {
  it('collapses every spelling of one IPv6 /64 to the same subject', () => {
    const subjects = [
      '2001:db8:1:2::1',
      '2001:0db8:0001:0002:0000:0000:0000:ffff',
      '2001:DB8:1:2:abcd::',
      'fe80:0:0:0::1%en0',
    ].map(visitorQuotaSubject);

    expect(subjects.slice(0, 3)).toEqual([
      '2001:db8:1:2::/64',
      '2001:db8:1:2::/64',
      '2001:db8:1:2::/64',
    ]);
    expect(subjects[3]).toBe('fe80:0:0:0::/64');
  });

  it('keeps IPv4 addresses whole, including IPv4-mapped IPv6', () => {
    expect(visitorQuotaSubject('203.0.113.7')).toBe('203.0.113.7');
    expect(visitorQuotaSubject('::ffff:203.0.113.7')).toBe('203.0.113.7');
  });

  it('passes through values it cannot parse rather than merging them', () => {
    expect(visitorQuotaSubject('2001:db8::1::2')).toBe('2001:db8::1::2');
    expect(visitorQuotaSubject('not-an-ip')).toBe('not-an-ip');
    expect(visitorQuotaSubject('0.0.0.0')).toBe('0.0.0.0');
  });
});
