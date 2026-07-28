import { describe, expect, it } from 'vitest';
import {
  parseCheckerUrl,
  setCheckerSnapshot,
  setCheckerTab,
} from './useCheckerUrlState';

describe('checker URL state', () => {
  it('accepts supported tabs and rejects unknown tabs', () => {
    expect(parseCheckerUrl('?tab=graphics').tab).toBe('graphics');
    expect(parseCheckerUrl('?tab=unknown').tab).toBe('all');
  });

  it('parses bounded snapshot context without treating it as live data', () => {
    expect(parseCheckerUrl('?fp=4Yx2a&cov=87.5&b=19')).toEqual({
      tab: 'all',
      snapshot: {
        fingerprintId: '4Yx2a',
        coverage: 87.5,
        baselineCount: 19,
      },
    });
    expect(parseCheckerUrl('?fp=%3Cscript%3E&cov=900&b=-1').snapshot).toBeNull();
    expect(parseCheckerUrl('?fp=abc&cov=900&b=1.5').snapshot).toEqual({
      fingerprintId: 'abc',
      coverage: null,
      baselineCount: null,
    });
  });

  it('updates a tab while preserving snapshot and unrelated parameters', () => {
    const next = setCheckerTab('?fp=abc&cov=80&ref=guide', 'security');
    expect(next).toContain('fp=abc');
    expect(next).toContain('cov=80');
    expect(next).toContain('ref=guide');
    expect(next).toContain('tab=security');
  });

  it('serializes an honest snapshot and preserves the selected tab', () => {
    const next = setCheckerSnapshot('?tab=media', {
      fingerprintId: 'abc123',
      coverage: 92.45,
      baselineCount: 18.9,
    });
    expect(next).toBe('?tab=media&fp=abc123&cov=92.5&b=18');
  });
});
