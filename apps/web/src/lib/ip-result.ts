import type { PublicIpLookupResult } from './public-ip-lookup';

export function assessIpResult(result: PublicIpLookupResult) {
  const { data } = result;
  const hasRisk =
    typeof data.score?.risk_score === 'number' &&
    Number.isFinite(data.score.risk_score);
  const proxy = [
    data.classification?.is_proxy,
    data.classification?.is_vpn,
    data.classification?.is_tor,
  ];
  const proxyFound = proxy.some((flag) => flag === true);
  const missing = [
    !hasRisk && 'Risk score',
    !proxy.every((flag) => typeof flag === 'boolean') &&
      'Proxy / VPN / Tor classification',
    !data.network?.asn &&
      !data.network?.org &&
      !data.network?.owner &&
      'Network ownership',
    !data.location?.country && !data.location?.country_code && 'Geolocation',
  ].filter((item): item is string => Boolean(item));
  const empty =
    !hasRisk &&
    !data.classification &&
    !data.location &&
    !data.network &&
    !data.routing;
  const elevated = result.highRisk === true || proxyFound;
  return {
    state: empty ? 'no-result' : missing.length ? 'partial' : 'success',
    elevated,
    missing,
    title: empty
      ? 'No intelligence returned'
      : proxyFound
        ? 'Proxy-related signals found'
        : elevated
          ? 'High-risk network signal'
          : hasRisk
            ? 'No elevated network risk'
            : 'Risk data unavailable',
    badge: empty
      ? 'No result'
      : !hasRisk
        ? 'Partial report'
        : elevated
          ? 'Review evidence'
          : 'Risk score returned',
    explanation: empty
      ? 'The provider returned the address without usable intelligence. Try again later or check another address.'
      : elevated
        ? 'Inspect the returned flags and evidence before making an access decision. A proxy or VPN can have legitimate uses.'
        : hasRisk
          ? 'No elevated risk was reported by the current data. A low score or an unflagged address is not proof of safety.'
          : 'Missing risk data means unknown. Available location or network data cannot establish that this address is safe.',
  };
}
