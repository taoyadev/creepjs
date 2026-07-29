import type { FingerprintResult } from '@creepjs/core';
import type { OwnIpSummary } from '@/lib/own-ip';
import type { OwnIpState } from '@/components/checker/hooks/useOwnIp';

export type TrustTone = 'clear' | 'neutral' | 'review';

export interface TrustDimension {
  label: string;
  value: string;
  detail: string;
  tone: TrustTone;
}

export interface NetworkTrustModel {
  headline: string;
  summary: string;
  tone: TrustTone;
  dimensions: TrustDimension[];
  guidance: string[];
  ip: OwnIpSummary | null;
}

function automationSignals(result: FingerprintResult) {
  const detections = result.data.resistance?.detections ?? {};
  return [
    result.data.navigator?.webdriver === true ? 'webdriver' : null,
    detections.webdriver ? 'webdriver resistance check' : null,
    detections.headless ? 'headless behavior' : null,
    detections.puppeteerDetected ? 'Puppeteer behavior' : null,
    detections.seleniumDetected ? 'Selenium behavior' : null,
  ].filter((signal): signal is string => signal !== null);
}

function riskTone(ip: OwnIpSummary): TrustTone {
  if (ip.risk?.highRisk || (ip.risk?.score ?? 0) >= 50) return 'review';
  return ip.risk ? 'clear' : 'neutral';
}

export function buildNetworkTrustModel(
  result: FingerprintResult,
  ownIp: OwnIpState
): NetworkTrustModel {
  const liesCount = result.data.lies?.liesCount ?? 0;
  const automation = automationSignals(result);
  const coverage = Math.round(
    (result.coverage?.ratio ?? result.confidence) * 100
  );
  const ip = ownIp.status === 'ready' ? ownIp.data : null;
  const dimensions: TrustDimension[] = [
    {
      label: 'Browser consistency',
      value:
        liesCount === 0
          ? 'No inconsistencies observed'
          : `${liesCount} inconsistenc${liesCount === 1 ? 'y' : 'ies'}`,
      detail:
        liesCount === 0
          ? 'The completed collectors did not report contradictory values.'
          : 'Review the Lies Detection card for the exact browser signals.',
      tone: liesCount === 0 ? 'clear' : 'review',
    },
    {
      label: 'Automation exposure',
      value:
        automation.length === 0
          ? 'No automation indicator observed'
          : automation.join(', '),
      detail:
        automation.length === 0
          ? 'Webdriver and common automation resistance checks were not positive.'
          : 'These are observable browser flags, not proof of malicious intent.',
      tone: automation.length === 0 ? 'clear' : 'review',
    },
    {
      label: 'Collector coverage',
      value: `${coverage}% complete`,
      detail: `${result.coverage.successful} succeeded, ${result.coverage.failed} failed, and ${result.coverage.skipped} were skipped.`,
      tone: coverage >= 80 ? 'clear' : 'neutral',
    },
    {
      label: 'Privacy resistance',
      value: result.data.resistance?.privacyToolDetected
        ? 'Resistance behavior observed'
        : 'No privacy tool inferred',
      detail: result.data.resistance?.privacyToolDetected
        ? 'Privacy defenses can intentionally standardize or modify fingerprint signals.'
        : 'Absence of a detected tool does not mean the browser is unprotected.',
      tone: 'neutral',
    },
  ];

  if (ownIp.status === 'loading') {
    dimensions.push({
      label: 'Network context',
      value: 'Loading',
      detail: 'The own-IP summary is being requested independently.',
      tone: 'neutral',
    });
  } else if (ownIp.status === 'error') {
    dimensions.push({
      label: 'Network context',
      value: 'Unavailable',
      detail: 'Browser findings remain valid; no IP-risk inference was made.',
      tone: 'neutral',
    });
  } else {
    const location = [
      ip?.location?.city,
      ip?.location?.region,
      ip?.location?.country_code,
    ]
      .filter(Boolean)
      .join(', ');
    dimensions.push({
      label: 'IP risk context',
      value: ip?.risk?.band ?? ip?.risk?.verdict ?? 'Geo and ASN context only',
      detail: ip?.risk
        ? `Upstream score ${ip.risk.score ?? 'not supplied'} for ${ip.ip}; this is context, not a probability estimate.`
        : `Risk enrichment was not available for ${ip?.ip ?? 'this address'}.`,
      tone: ip ? riskTone(ip) : 'neutral',
    });
    dimensions.push({
      label: 'Network owner and location',
      value:
        ip?.asn?.organization ??
        (ip?.asn?.number ? `AS${ip.asn.number}` : 'Not available'),
      detail:
        location || 'Location was not available in the free request context.',
      tone: 'neutral',
    });
  }

  const review = dimensions.filter((dimension) => dimension.tone === 'review');
  return {
    headline:
      review.length > 0
        ? 'Review the highlighted indicators'
        : 'No elevated indicator was observed',
    summary:
      review.length > 0
        ? `${review.length} dimension${review.length === 1 ? '' : 's'} deserves context before a trust decision.`
        : 'The available browser and network observations are internally calm, but they do not prove identity or safety.',
    tone: review.length > 0 ? 'review' : 'clear',
    dimensions,
    guidance:
      review.length > 0
        ? [
            'Open the named browser cards before treating an inconsistency as hostile.',
            'Compare IP risk with account, session, and behavioral evidence outside CreepJS.',
          ]
        : [
            'Keep browser and network evidence separate from identity decisions.',
            'Re-run after meaningful browser, extension, or network changes.',
          ],
    ip,
  };
}
