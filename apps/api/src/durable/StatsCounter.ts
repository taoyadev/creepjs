/**
 * Cumulative counters for the uniqueness stats (services/uniqueness.ts).
 *
 * These used to be KV read-modify-writes on every fingerprint request: up to
 * six writes, one of them to the same total key each time. KV allows about one
 * write per second per key and has no compare-and-swap, so under load the
 * writes failed (failing the request after its quota was already spent) or
 * raced and lost counts. One object serializes the increments instead, and a
 * request touches it once however many buckets it bumps.
 */

export type StatsRequest =
  | { op: 'increment'; keys: string[] }
  | { op: 'read'; keys: string[] };

export type StatsResult = Record<string, number>;

interface StatsEnv {
  /** Pre-migration counters, read once per key so history carries over. */
  FP_STATS?: KVNamespace;
}

export class StatsCounter {
  private readonly state: DurableObjectState;
  private readonly env: StatsEnv;

  constructor(state: DurableObjectState, env: StatsEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const body = await request.json<StatsRequest>();
    // Storage reads yield, so concurrent increments could otherwise interleave
    // between the read and the write and drop a count.
    const result = await this.state.blockConcurrencyWhile(() =>
      this.apply(body)
    );
    return Response.json(result);
  }

  private async apply(request: StatsRequest): Promise<StatsResult> {
    const keys = [...new Set(request.keys)];
    const counts = await this.load(keys);

    if (request.op === 'increment') {
      for (const key of keys) counts[key] = (counts[key] ?? 0) + 1;
      await this.state.storage.put(counts);
    }

    return counts;
  }

  /** Current counts, seeding any key this object has not stored yet from KV. */
  private async load(keys: string[]): Promise<StatsResult> {
    const stored = await this.state.storage.get<number>(keys);
    const counts: StatsResult = {};
    const seeded: StatsResult = {};

    for (const key of keys) {
      const value = stored.get(key);
      if (value !== undefined) {
        counts[key] = value;
        continue;
      }
      const legacy = Number.parseInt(
        (await this.env.FP_STATS?.get(key, 'text')) ?? '0',
        10
      );
      counts[key] = Number.isFinite(legacy) ? legacy : 0;
      seeded[key] = counts[key];
    }

    // Persist seeds even on a read, so KV is consulted once per key.
    if (Object.keys(seeded).length > 0) {
      await this.state.storage.put(seeded);
    }
    return counts;
  }
}
