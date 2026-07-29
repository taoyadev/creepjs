/**
 * Minimal typed fetch helper for the CreepJS API (deliberately not a data
 * library): one shared error shape, an abortable timeout, and a single
 * retry for idempotent GETs. All client data fetching should go through
 * this instead of hand-rolled fetch + cancelled flags.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.creepjs.org';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly retryAfter: number | null;

  constructor(
    message: string,
    status: number,
    body?: unknown,
    retryAfter: number | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.retryAfter = retryAfter;
  }
}

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface FetchJsonOptions extends Omit<RequestInit, 'signal'> {
  /** Abort the request after this many milliseconds (default 10s). */
  timeoutMs?: number;
  /** Retry once on network failure / 5xx for idempotent GETs (default true for GET). */
  retry?: boolean;
  /** Caller-provided signal (composed with the timeout). */
  signal?: AbortSignal;
}

async function attempt<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  callerSignal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onCallerAbort = () => controller.abort();
  if (callerSignal?.aborted) {
    controller.abort();
  } else {
    callerSignal?.addEventListener('abort', onCallerAbort, { once: true });
  }

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const isJson = res.headers
      .get('content-type')
      ?.includes('application/json');
    const body: unknown = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message =
        (typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof (body as { error: unknown }).error === 'string' &&
          (body as { error: string }).error) ||
        `Request failed with status ${res.status}`;
      const retryAfterHeader = res.headers.get('retry-after');
      const retryAfter =
        retryAfterHeader && Number.isFinite(Number(retryAfterHeader))
          ? Number(retryAfterHeader)
          : null;
      throw new ApiError(message, res.status, body, retryAfter);
    }

    return body as T;
  } catch (error) {
    if (timedOut) {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408);
    }
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const {
    timeoutMs = 10_000,
    retry = method === 'GET',
    signal,
    ...init
  } = options;
  const url = apiUrl(path);

  try {
    return await attempt<T>(url, init, timeoutMs, signal);
  } catch (error) {
    const aborted = signal?.aborted;
    const retriable =
      !aborted &&
      method === 'GET' &&
      retry &&
      (!(error instanceof ApiError) || error.status >= 500);
    if (!retriable) throw error;
    return attempt<T>(url, init, timeoutMs, signal);
  }
}
