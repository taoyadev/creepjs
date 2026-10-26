import type { Context } from 'hono';
import type { Env } from '../types';

export function logEvent(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}

export function logError(event: Record<string, unknown>) {
  console.error(JSON.stringify(event));
}

/**
 * Run `task` after the response is sent. A failure is logged, never thrown:
 * bookkeeping must not fail a request whose quota is already spent.
 */
export function runAfterResponse(
  c: Context<Env>,
  msg: string,
  task: () => Promise<unknown>
): void {
  const guarded = task().catch((error: unknown) => {
    logError({
      msg,
      request_id: c.get('requestId') ?? null,
      error: error instanceof Error ? error.message : String(error),
    });
  });
  try {
    c.executionCtx.waitUntil(guarded);
  } catch {
    // No ExecutionContext (app.fetch called directly): the task still runs.
  }
}
