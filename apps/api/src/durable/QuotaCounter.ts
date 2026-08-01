/**
 * Atomic rolling-window counter.
 *
 * KV has no compare-and-swap, so the read-modify-write this replaces let
 * concurrent requests all observe the same pre-increment count and each write
 * back count+1. A burst therefore passed a daily cap in full, which mattered
 * because these caps are what protect the paid upstream IP quota.
 *
 * A Durable Object serializes work per counter key, so the check and the
 * increment happen together.
 */

export type QuotaOp = 'reserve' | 'release';

export interface QuotaRequest {
  op: QuotaOp;
  cost: number;
  /** Required for `reserve`; ignored by `release`. */
  limit?: number;
  windowMs: number;
}

export interface QuotaResult {
  allowed: boolean;
  count: number;
  resetAt: number;
}

interface StoredWindow {
  count: number;
  resetAt: number;
}

const STORAGE_KEY = 'window';

export class QuotaCounter {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const body = await request.json<QuotaRequest>();
    // Storage reads yield, so two in-flight requests to this object could
    // otherwise interleave between the read and the write.
    const result = await this.state.blockConcurrencyWhile(() =>
      this.apply(body)
    );
    return Response.json(result);
  }

  /** Drops storage once the window is over so per-visitor counters do not accumulate. */
  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }

  private async apply(request: QuotaRequest): Promise<QuotaResult> {
    const now = Date.now();
    const stored = await this.state.storage.get<StoredWindow>(STORAGE_KEY);
    const active = stored && now < stored.resetAt;

    let count = active ? stored.count : 0;
    const resetAt = active ? stored.resetAt : now + request.windowMs;

    if (request.op === 'release') {
      // Refunds a reservation whose work did not end up consuming budget.
      count = Math.max(0, count - request.cost);
      await this.commit(count, resetAt);
      return { allowed: true, count, resetAt };
    }

    const limit = request.limit ?? 0;
    const allowed = count + request.cost <= limit;
    if (allowed) {
      count += request.cost;
      await this.commit(count, resetAt);
    }

    return { allowed, count, resetAt };
  }

  private async commit(count: number, resetAt: number): Promise<void> {
    await this.state.storage.put<StoredWindow>(STORAGE_KEY, {
      count,
      resetAt,
    });
    await this.state.storage.setAlarm(resetAt);
  }
}
