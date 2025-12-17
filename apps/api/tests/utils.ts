import type { Env, TokenData } from '../src/types';

type KVStoredValue = {
  value: string;
  metadata?: unknown;
  expiration?: number | null;
};

const jsonEncode = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

export const createMockKV = (
  initial: Record<string, string> = {}
): KVNamespace => {
  const store = new Map<string, KVStoredValue>();
  Object.entries(initial).forEach(([key, value]) => {
    store.set(key, { value });
  });

  return {
    async get(
      key: string,
      typeOrOptions?:
        | 'text'
        | 'json'
        | 'arrayBuffer'
        | 'stream'
        | { type: 'text' | 'json' | 'arrayBuffer' | 'stream' }
    ): Promise<any> {
      const entry = store.get(key);
      if (!entry) return null;

      const type =
        typeof typeOrOptions === 'string'
          ? typeOrOptions
          : (typeOrOptions?.type ?? 'text');

      if (type === 'json') {
        return JSON.parse(entry.value);
      }
      if (type === 'arrayBuffer') {
        return new TextEncoder().encode(entry.value).buffer;
      }
      if (type === 'stream') {
        const encoder = new TextEncoder();
        return new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(entry.value));
            controller.close();
          },
        });
      }

      return entry.value;
    },
    async put(
      key: string,
      value: string,
      options?: { expiration?: number; expirationTtl?: number }
    ): Promise<void> {
      const expiration =
        options?.expiration ??
        (options?.expirationTtl
          ? Date.now() + options.expirationTtl * 1000
          : null);
      store.set(key, { value, expiration });
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    async list(): Promise<{
      keys: Array<{ name: string; expiration?: number | null; metadata?: any }>;
      list_complete: boolean;
      cursor?: string;
    }> {
      return {
        keys: Array.from(store.entries()).map(([name, entry]) => ({
          name,
          expiration: entry.expiration ?? null,
          metadata: entry.metadata ?? null,
        })),
        list_complete: true,
      };
    },
  } as KVNamespace;
};

export const createTestEnv = ({
  tokens,
  rateLimits,
  bindings,
}: {
  tokens?: Record<string, string>;
  rateLimits?: Record<string, string>;
  bindings?: Partial<Env['Bindings']>;
} = {}): Env['Bindings'] => ({
  TOKENS: createMockKV(tokens),
  RATE_LIMIT: createMockKV(rateLimits),
  ENVIRONMENT: 'test',
  CORS_ORIGIN: '*',
  RATE_LIMIT_PER_DAY: '1000',
  ...bindings,
});

export const seedToken = (
  env: Env['Bindings'],
  token: string,
  data: TokenData
) => {
  const tokensKV = env.TOKENS;
  return tokensKV.put(token, jsonEncode(data));
};
