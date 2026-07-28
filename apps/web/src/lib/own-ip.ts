export interface OwnIpSummary {
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
  cached?: boolean;
  risk?: {
    score?: number;
    band?: string;
    verdict?: string;
    highRisk: boolean;
  };
  error?: string;
}
