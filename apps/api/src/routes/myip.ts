import { Hono, type Context } from 'hono';
import type { Env } from '../types';
import { IpbotError, type IpbotResponse, lookupIP } from '../services/ipbot';

const app = new Hono<Env>();

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

function clientIp(c: Context<Env>) {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1'
  ).trim();
}

function isPrivateOrLocalIp(ip: string) {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
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

  try {
    const result = await lookupIP(ip, c.env);
    return c.json(transformIpbotResult(result.data, ip, result.cached));
  } catch (error) {
    if (error instanceof IpbotError) {
      console.warn(`myip.lookup_failed ip=${ip} status=${error.status ?? 500}`);
      return c.json(
        transformIpbotResult(
          null,
          ip,
          false,
          'IP intelligence temporarily unavailable'
        )
      );
    }
    throw error;
  }
});

export default app;
