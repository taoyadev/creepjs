export type Env = {
  Bindings: {
    TOKENS: KVNamespace;
    RATE_LIMIT: KVNamespace;
    IP_CACHE: KVNamespace;
    ENVIRONMENT: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_PER_DAY: string;
    IPINFO_TOKEN: string;
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
