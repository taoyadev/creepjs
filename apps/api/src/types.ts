export type Env = {
  Bindings: {
    TOKENS: KVNamespace;
    RATE_LIMIT: KVNamespace;
    IP_CACHE: KVNamespace;
    ENVIRONMENT: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_PER_DAY: string;
    IPINFO_TOKEN: string;
    IPBOT_API_ORIGIN: string;
    IPBOT_API_KEY: string;
    // Optional public /v1/ip/public limits (defaults applied in the route).
    PUBLIC_IP_DAILY_PER_IP?: string;
    PUBLIC_IP_DAILY_GLOBAL?: string;
  };
  Variables: {
    token: string;
    tokenData: TokenData;
  };
};

export interface TokenData {
  email: string;
  createdAt: number;
  usageCount: number;
}

export interface RateLimitData {
  count: number;
  resetAt: number;
}
