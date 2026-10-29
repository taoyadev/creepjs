import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import IpRiskPage from './page';
import { assessIpResult } from '@/lib/ip-result';
import type {
  IpIntelligenceData,
  PublicIpLookupResult,
} from '@/lib/public-ip-lookup';

describe('IP lookup first render', () => {
  it('does not accept input before its change handlers can preserve ownership', () => {
    const html = renderToStaticMarkup(createElement(IpRiskPage));
    const input = /<input[^>]*id="ip-address"[^>]*>/.exec(html)?.[0];
    expect(input).toContain('disabled=""');
    expect(html).toContain('Preparing lookup controls');
    expect(html).not.toContain('Ready. Results include');
  });
});

function result(
  data: Partial<IpIntelligenceData>,
  highRisk = false
): PublicIpLookupResult {
  return {
    data: { ip: '8.8.8.8', ...data },
    cached: false,
    highRisk,
    rateLimit: { limit: 30, remaining: 29, reset: null, tier: 'public' },
  };
}

describe('IP report interpretation', () => {
  it('never calls missing risk data low risk', () => {
    const assessment = assessIpResult(
      result({ location: { country_code: 'US' } })
    );
    expect(assessment.state).toBe('partial');
    expect(assessment.title).toBe('Risk data unavailable');
    expect(assessment.explanation).toContain('unknown');
    expect(assessment.missing).toContain('Risk score');
  });
  it('treats a valid zero score and explicit false flags as returned data', () => {
    const assessment = assessIpResult(
      result({
        score: { risk_score: 0 },
        classification: { is_proxy: false, is_vpn: false, is_tor: false },
        network: { asn: 'AS15169' },
        location: { country_code: 'US' },
      })
    );
    expect(assessment.state).toBe('success');
    expect(assessment.title).toBe('No elevated network risk');
    expect(assessment.explanation).toContain('not proof of safety');
    expect(assessment.missing).toEqual([]);
  });
  it('keeps positive proxy evidence visible even when a score is low', () => {
    const assessment = assessIpResult(
      result({ score: { risk_score: 0 }, classification: { is_proxy: true } })
    );
    expect(assessment.elevated).toBe(true);
    expect(assessment.title).toBe('Proxy-related signals found');
    expect(assessment.state).toBe('partial');
  });
  it('labels an address-only response as no result', () => {
    const assessment = assessIpResult(result({}));
    expect(assessment.state).toBe('no-result');
    expect(assessment.title).toBe('No intelligence returned');
  });
});
