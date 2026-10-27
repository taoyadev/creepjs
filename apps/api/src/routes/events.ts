import { Hono } from 'hono';
import { ANALYTICS_PROP_COLUMNS } from '@creepjs/core/analytics-events';
import type { Env } from '../types';
import { siteOrigin } from '../middleware/cors';
import { logError } from '../utils/logging';
import { AnalyticsEventRequestSchema } from '../utils/validation';

const app = new Hono<Env>();

/** Largest accepted body. A real event is well under 300 bytes. */
export const MAX_EVENT_BODY_BYTES = 1024;

/**
 * `navigator.sendBeacon` sends a `text/plain` Blob, a CORS-safelisted type, so
 * the browser skips the preflight. `application/json` is for curl and tests.
 */
const ACCEPTED_CONTENT_TYPES = new Set(['text/plain', 'application/json']);

/**
 * Read at most `limit` bytes of the body. Returns null when the body is larger,
 * so an oversized request is rejected without buffering all of it.
 */
async function readCappedBody(
  request: Request,
  limit: number
): Promise<string | null> {
  if (!request.body) return '';
  const reader = (request.body as ReadableStream<Uint8Array>).getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * POST /v1/events — the site's product analytics (tool runs and a few UI
 * events), written to Workers Analytics Engine.
 *
 * Public and token-free, so it is kept cheap and narrow: the site origin only,
 * a 1 KiB body, and an allowlisted schema. It touches no KV, QuotaCounter or
 * StatsCounter. Nothing that identifies a person or device is stored: no IP,
 * user agent, token or fingerprint ID — only the event name, the page path
 * and allowlisted low-cardinality props.
 */
app.post('/', async (c) => {
  const origin = c.req.header('Origin');
  const allowed = siteOrigin(c.env);
  if (!origin || (allowed !== '*' && origin !== allowed)) {
    return c.json({ error: 'Origin not allowed' }, 403);
  }

  const [mediaType = ''] = (c.req.header('Content-Type') ?? '').split(';');
  const contentType = mediaType.trim().toLowerCase();
  if (!ACCEPTED_CONTENT_TYPES.has(contentType)) {
    return c.json({ error: 'Unsupported content type' }, 415);
  }

  const declaredLength = Number(c.req.header('Content-Length'));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_EVENT_BODY_BYTES
  ) {
    return c.json({ error: 'Event too large' }, 413);
  }
  const raw = await readCappedBody(c.req.raw, MAX_EVENT_BODY_BYTES);
  if (raw === null) {
    return c.json({ error: 'Event too large' }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const parsed = AnalyticsEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Invalid event', details: parsed.error.flatten().fieldErrors },
      400
    );
  }

  const event = parsed.data;
  const dataset = c.env.EVENTS;
  if (dataset) {
    try {
      // Fixed columns: blob1 name, blob2 path, then one column per prop in
      // ANALYTICS_PROP_COLUMNS order; '' when the event did not send it.
      dataset.writeDataPoint({
        indexes: [event.name],
        blobs: [
          event.name,
          event.path,
          ...ANALYTICS_PROP_COLUMNS.map((prop) => event.props[prop] ?? ''),
        ],
        doubles: [1],
      });
    } catch (error) {
      logError({
        msg: 'events.write_failed',
        request_id: c.get('requestId') ?? null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return c.body(null, 204);
});

export default app;
