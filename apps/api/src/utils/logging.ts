import type { Context } from 'hono';
import type { Env } from '../types';
import { isValidIp } from '../services/ipbot';

export function logEvent(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}

export function logError(event: Record<string, unknown>) {
  console.error(JSON.stringify(event));
}

/**
 * A request path fit for a log line. The lookup routes carry the queried IP
 * in the path (/v1/ip/:ip, /v1/ip/public/:ip), and logs name IPs only by
 * `ip_hash` (docs/SECURITY.md), so any segment that is an IP becomes `:ip`.
 */
export function pathForLog(path: string): string {
  return path
    .split('/')
    .map((segment) => (isValidIp(segment) ? ':ip' : segment))
    .join('/');
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
