import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers (works with Cloudflare, Vercel, etc.)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    // Priority: CF-Connecting-IP > X-Real-IP > X-Forwarded-For
    let clientIp = cfConnectingIp || realIp || forwarded?.split(',')[0] || '127.0.0.1';
    clientIp = clientIp.trim();

    console.log('Detected client IP:', clientIp);

    // Get IPInfo token from environment
    const token = process.env.IPINFO_TOKEN || '1562dc669bda56';

    // Fetch IP data from IPInfo.io API
    const ipinfoUrl = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.')
      ? `https://ipinfo.io/json?token=${token}` // Auto-detect for local IPs
      : `https://ipinfo.io/${clientIp}?token=${token}`;

    console.log('Fetching from:', ipinfoUrl);

    const response = await fetch(ipinfoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`IPInfo API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as IpInfoResponse;
    console.log('IPInfo response:', data);

    // Transform IPInfo.io format to match our expected format
    const [latitudeRaw, longitudeRaw] = data.loc?.split(',') ?? [];
    const latitude = latitudeRaw ? Number.parseFloat(latitudeRaw) : undefined;
    const longitude = longitudeRaw ? Number.parseFloat(longitudeRaw) : undefined;

    const asMatch = data.org?.match(/^AS(\d+)/);
    const organization = data.org?.replace(/^AS\d+\s+/, '').trim();

    const transformedData = {
      ip: data.ip ?? clientIp,
      location: {
        country_code: data.country ?? null,
        city: data.city ?? null,
        region: data.region ?? null,
        latitude,
        longitude,
        postal: data.postal ?? null,
        timezone: data.timezone ?? null,
      },
      asn: data.org
        ? {
            organization: organization || undefined,
            number: asMatch ? Number.parseInt(asMatch[1], 10) : undefined,
          }
        : undefined,
      hostname: data.hostname ?? null,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching IP data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch IP data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
