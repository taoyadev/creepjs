import { Hono, type Context } from 'hono';
import type { Env } from '../types';
import { IpbotError, type IpbotResponse, lookupIP } from '../services/ipbot';
import { bumpCounter, clientIp, intEnv, readCounter } from '../utils/counters';
import { hashIpForLog } from '../utils/privacy';

const app = new Hono<Env>();

// The paid IPbot lookup is metered: geolocation always comes free from
// request.cf, so the upstream call only buys the `risk` block. Per-visitor
// and global daily caps keep an unauthenticated endpoint from draining the
// paid quota (a visitor's own IP is unique, so KV caching cannot amortize
// this endpoint the way it does /v1/ip lookups).
const MYIP_RISK_DAILY_PER_VISITOR_DEFAULT = 10;
const PUBLIC_GLOBAL_DEFAULT = 2000; // shared budget with /v1/ip/public
const GLOBAL_KEY = 'pubip:global';

interface MyIpResponse {
  ip: string;
  location?: {
    country_code?: string | null;
    city?: string | null;
    region?: string | null;
    postal?: string | null;
    latitude?: number;
    longitude?: number;
    timezone?: string | null;
  };
  asn?: {
    organization?: string;
    number?: number;
  };
  hostname?: string | null;
  cached: boolean;
  risk?: {
    score?: number;
    band?: string;
    verdict?: string;
    highRisk: boolean;
  };
  error?: string;
}

function isPrivateOrLocalIp(ip: string) {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip === '0.0.0.0' || ip === '::') return true; // unspecified / unknown caller
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')) {
    return true;
  }
  return false;
}

function toAsnNumber(asn: string | undefined) {
  if (!asn) return undefined;
  const match = /^AS(\d+)$/i.exec(asn);
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

/** Zero-cost geolocation from Cloudflare's own request metadata. */
function cfGeo(c: Context<Env>): Pick<MyIpResponse, 'location' | 'asn'> {
  const cf = (c.req.raw as Request & { cf?: IncomingRequestCfProperties }).cf;
  if (!cf) return {};

  const num = (v: unknown): number | undefined => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v !== '') {
      const n = Number.parseFloat(v);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  return {
    location: {
      country_code: cf.country ?? null,
      city: cf.city ?? null,
      region: cf.region ?? null,
      postal: cf.postalCode ?? null,
      latitude: num(cf.latitude),
      longitude: num(cf.longitude),
      timezone: cf.timezone ?? null,
    },
    asn:
      typeof cf.asn === 'number' || cf.asOrganization
        ? {
            organization: cf.asOrganization,
            number: typeof cf.asn === 'number' ? cf.asn : undefined,
          }
        : undefined,
  };
}

function transformIpbotResult(
  source: IpbotResponse | null,
  ip: string,
  cached: boolean,
  error?: string
): MyIpResponse {
  return {
    ip: source?.ip ?? ip,
    location: source?.location
      ? {
          country_code: source.location.country_code ?? null,
          city: source.location.city ?? null,
          region: source.location.region ?? null,
          postal: source.location.postal ?? null,
          latitude: source.location.latitude,
          longitude: source.location.longitude,
          timezone: source.location.timezone ?? null,
        }
      : undefined,
    asn: source?.network
      ? {
          organization: source.network.org,
          number: toAsnNumber(source.network.asn),
        }
      : undefined,
    hostname: typeof source?.hostname === 'string' ? source.hostname : null,
    cached,
    risk: source?.score
      ? {
          score: source.score.risk_score,
          band: source.score.band,
          verdict: source.score.verdict,
          highRisk:
            typeof source.score.risk_score === 'number'
              ? source.score.risk_score >= 50
              : (source.score.verdict ?? '').toLowerCase() !== 'allow',
        }
      : undefined,
    ...(error ? { error } : {}),
  };
}

app.get('/', async (c) => {
  const ip = clientIp(c);

  if (isPrivateOrLocalIp(ip)) {
    return c.json(transformIpbotResult(null, ip, false));
  }

  const geoOnly = (error?: string): MyIpResponse => ({
    ip,
    ...cfGeo(c),
    hostname: null,
    cached: false,
    ...(error ? { error } : {}),
  });

  // Meter the paid risk lookup; on cap exhaustion degrade to cf-geo only
  // (the response shape stays valid — `risk` is optional).
  const perVisitorLimit = intEnv(
    c.env.MYIP_RISK_DAILY_PER_IP,
    MYIP_RISK_DAILY_PER_VISITOR_DEFAULT
  );
  const globalLimit = intEnv(
    c.env.PUBLIC_IP_DAILY_GLOBAL,
    PUBLIC_GLOBAL_DEFAULT
  );
  const visitorKey = `myip:ip:${await hashIpForLog(ip)}`;
  const perVisitor = await readCounter(c.env, visitorKey);
  if (perVisitor.count >= perVisitorLimit) {
    return c.json(geoOnly());
  }
  const globalCount = await readCounter(c.env, GLOBAL_KEY);
  if (globalCount.count >= globalLimit) {
    return c.json(geoOnly());
  }

  try {
    const result = await lookupIP(ip, c.env);
    if (!result.cached) {
      // Only uncached lookups consume the paid upstream budget.
      await bumpCounter(c.env, visitorKey, perVisitor);
      await bumpCounter(c.env, GLOBAL_KEY, globalCount);
    }
    return c.json(transformIpbotResult(result.data, ip, result.cached));
  } catch (error) {
    if (error instanceof IpbotError) {
      // Never log the raw visitor IP (docs/SECURITY.md).
      console.warn(`myip.lookup_failed status=${error.status ?? 500}`);
      return c.json(geoOnly('IP intelligence temporarily unavailable'));
    }
    throw error;
  }
});

export default app;
