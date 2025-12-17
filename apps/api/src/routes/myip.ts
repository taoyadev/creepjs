import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<Env>();

interface IpInfoResponse {
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  loc?: string;
  postal?: string;
  timezone?: string;
  org?: string;
  hostname?: string;
}

interface TransformedIPData {
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
}

// Cache TTL: 1 hour
const CACHE_TTL = 3600;

app.get('/', async (c) => {
  try {
    // Get client IP from headers
    const cfConnectingIp = c.req.header('cf-connecting-ip');
    const xForwardedFor = c.req.header('x-forwarded-for');
    const xRealIp = c.req.header('x-real-ip');

    // Priority: CF-Connecting-IP > X-Real-IP > X-Forwarded-For
    let clientIp =
      cfConnectingIp || xRealIp || xForwardedFor?.split(',')[0] || '127.0.0.1';
    clientIp = clientIp.trim();

    console.log('Detected client IP:', clientIp);

    // Check KV cache first
    const cacheKey = `ip:${clientIp}`;
    const cached = await c.env.IP_CACHE.get(cacheKey, 'json');

    if (cached) {
      console.log('Cache hit for IP:', clientIp);
      return c.json({
        ...cached,
        cached: true,
      });
    }

    console.log('Cache miss for IP:', clientIp);

    // Fetch from IPInfo.io API
    const token = c.env.IPINFO_TOKEN;
    const ipinfoUrl =
      clientIp === '::1' ||
      clientIp === '127.0.0.1' ||
      clientIp.startsWith('192.168.')
        ? `https://ipinfo.io/json?token=${token}` // Auto-detect for local IPs
        : `https://ipinfo.io/${clientIp}?token=${token}`;

    console.log('Fetching from:', ipinfoUrl);

    const response = await fetch(ipinfoUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`IPInfo API responded with status: ${response.status}`);
    }

    const data: IpInfoResponse = await response.json();
    console.log('IPInfo response:', data);

    // Transform data
    const [latitudeRaw, longitudeRaw] = data.loc?.split(',') ?? [];
    const latitude = latitudeRaw ? Number.parseFloat(latitudeRaw) : undefined;
    const longitude = longitudeRaw
      ? Number.parseFloat(longitudeRaw)
      : undefined;

    const asMatch = data.org?.match(/^AS(\d+)/);
    const organization = data.org?.replace(/^AS\d+\s+/, '').trim();

    const transformedData: TransformedIPData = {
      ip: data.ip ?? clientIp,
      location: {
        country_code: data.country ?? null,
        city: data.city ?? null,
        region: data.region ?? null,
        postal: data.postal ?? null,
        latitude,
        longitude,
        timezone: data.timezone ?? null,
      },
      asn: data.org
        ? {
            organization: organization || undefined,
            number: asMatch?.[1] ? Number.parseInt(asMatch[1], 10) : undefined,
          }
        : undefined,
      hostname: data.hostname ?? null,
    };

    // Store in KV cache with TTL
    await c.env.IP_CACHE.put(cacheKey, JSON.stringify(transformedData), {
      expirationTtl: CACHE_TTL,
    });

    console.log('Stored in cache with TTL:', CACHE_TTL);

    return c.json({
      ...transformedData,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching IP data:', error);
    return c.json(
      {
        error: 'Failed to fetch IP data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
