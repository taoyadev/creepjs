import type { OwnIpSummary } from '@/lib/own-ip';

export function buildNetworkExportSummary(ip: OwnIpSummary) {
  return {
    ip: ip.ip,
    location: ip.location,
    asn: ip.asn,
    risk: ip.risk
      ? {
          score: ip.risk.score,
          band: ip.risk.band,
          verdict: ip.risk.verdict,
          highRisk: ip.risk.highRisk,
        }
      : null,
    riskEnrichmentAvailable: Boolean(ip.risk),
  };
}

export function buildNetworkCsvRows(ip: OwnIpSummary): string[][] {
  const location = [
    ip.location?.city,
    ip.location?.region,
    ip.location?.country_code,
  ]
    .filter(Boolean)
    .join(', ');

  return [
    ['Network Trust', 'Public IP', ip.ip],
    ['Network Trust', 'Location', location || 'N/A'],
    [
      'Network Trust',
      'ASN',
      ip.asn?.number ? `AS${ip.asn.number}` : 'N/A',
    ],
    [
      'Network Trust',
      'Organization',
      ip.asn?.organization ?? 'N/A',
    ],
    [
      'Network Trust',
      'Risk Band',
      ip.risk?.band ?? ip.risk?.verdict ?? 'Geo only',
    ],
    [
      'Network Trust',
      'Risk Score',
      typeof ip.risk?.score === 'number' ? String(ip.risk.score) : 'N/A',
    ],
    ['', '', ''],
  ];
}
