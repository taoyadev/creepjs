import { ApiError, fetchJson } from './api-client';

export type IpLookupRateLimit = {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
  tier: string | null;
};

export type IpIntelligenceData = {
  ip: string;
  stack?: string;
  location?: {
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  network?: {
    asn?: string;
    org?: string;
    category?: string;
    service_role?: string;
    owner?: string;
  };
  routing?: {
    origin_asn?: string;
    prefix?: string;
    rpki_status?: string;
  };
  score?: {
    ip_score?: number;
    risk_score?: number;
    band?: string;
    verdict?: string;
    recommended_action?: string;
  };
  classification?: {
    usage_type?: string;
    is_datacenter?: boolean;
    is_proxy?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    threat_level?: string;
  };
  evidence?: {
    signals?: Array<{
      category?: string;
      label?: string;
      severity?: string;
      confidence?: string;
      description?: string;
    }>;
  };
};

export type PublicIpLookupResult = {
  data: IpIntelligenceData;
  cached: boolean;
  highRisk: boolean;
  rateLimit: IpLookupRateLimit;
};

export class IpInputError extends Error {
  constructor(message = 'Enter a valid IPv4 or IPv6 address.') {
    super(message);
    this.name = 'IpInputError';
  }
}

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPV6_GROUP_RE = /^[0-9a-fA-F]{1,4}$/;

/**
 * Match the Worker IP-literal boundary so invalid input fails locally without
 * consuming public lookup quota.
 */
export function isValidIpLiteral(rawValue: string): boolean {
  const value = rawValue.trim();
  if (!value || value.length > 45) return false;
  if (IPV4_RE.test(value)) return true;

  const address = value.split('%')[0] ?? value;
  if (!/^[0-9a-fA-F:]+$/.test(address) || !address.includes(':')) return false;
  if (address.includes(':::')) return false;

  const compressions = address.match(/::/g)?.length ?? 0;
  if (compressions > 1) return false;

  if (compressions === 0) {
    const groups = address.split(':');
    return (
      groups.length === 8 && groups.every((group) => IPV6_GROUP_RE.test(group))
    );
  }

  const [left = '', right = ''] = address.split('::');
  if (left.startsWith(':') || right.endsWith(':')) return false;
  const groups = [
    ...(left ? left.split(':') : []),
    ...(right ? right.split(':') : []),
  ];
  return (
    groups.length <= 7 && groups.every((group) => IPV6_GROUP_RE.test(group))
  );
}

export async function lookupPublicIp(
  rawValue: string,
  signal?: AbortSignal
): Promise<PublicIpLookupResult> {
  const value = rawValue.trim();
  if (!isValidIpLiteral(value)) throw new IpInputError();

  const result = await fetchJson<PublicIpLookupResult>(
    `/v1/ip/public/${encodeURIComponent(value)}`,
    {
      headers: { Accept: 'application/json' },
      signal,
    }
  );
  if (
    typeof result?.data?.ip !== 'string' ||
    !isValidIpLiteral(result.data.ip)
  ) {
    throw new ApiError('The lookup returned no usable address data.', 502);
  }
  return result;
}

/**
 * Convert transport/provider errors into a stable user-facing message without
 * reflecting the submitted IP or upstream payload.
 */
export function publicIpLookupErrorMessage(error: unknown): string {
  if (error instanceof IpInputError) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return error.retryAfter
        ? `Free lookup limit reached. Try again in ${error.retryAfter} seconds.`
        : 'Free lookup limit reached. Try again later.';
    }
    if (error.status === 400) return 'Enter a valid IPv4 or IPv6 address.';
    if (error.status === 408 || error.status >= 500) {
      return 'IP intelligence is temporarily unavailable. Try again shortly.';
    }
    return 'The IP lookup could not be completed. Check the address and try again.';
  }
  return 'Unable to reach the CreepJS API. Check your connection and try again.';
}
