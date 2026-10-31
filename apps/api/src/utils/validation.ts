import type { Context } from 'hono';
import * as z from 'zod';
import {
  ANALYTICS_EVENTS,
  isAnalyticsEventName,
  isValidAnalyticsPropValue,
  normalizeAnalyticsPath,
  type AnalyticsPropName,
} from '@creepjs/core/analytics-events';
import { FingerprintDataSchema } from './fingerprintDataSchema';

const CollectorSummarySchema = z.object({
  status: z.enum(['success', 'error', 'skipped']),
  duration: z.number(),
  value: z.unknown().optional(),
  error: z.string().optional(),
});

const CoverageSchema = z.object({
  ratio: z.number(),
  successful: z.number(),
  failed: z.number(),
  skipped: z.number(),
});

export const FingerprintRequestSchema = z.object({
  fingerprintId: z.string(),
  data: FingerprintDataSchema,
  timestamp: z.number(),
  confidence: z.number(),
  coverage: CoverageSchema.optional(),
  collectors: z.record(z.string(), CollectorSummarySchema).optional(),
  timings: z.record(z.string(), z.number()).optional(),
});

export const TokenRequestSchema = z.object({
  email: z.email(),
});

/** Advertising inquiry from the site's sponsor dialog. */
export const SponsorInquirySchema = z.strictObject({
  email: z.email().max(254),
  website: z
    .url({ protocol: /^https?$/ })
    .max(200)
    .optional(),
});

/**
 * Batch IP lookup body. Only the envelope is validated here (an array of
 * 1–50 strings); each address is validated per-item in the route so a single
 * malformed entry yields a per-row error instead of rejecting the whole batch.
 */
export const IpBatchRequestSchema = z.object({
  ips: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'IP entries must not be empty')
        .max(45, 'IP entries must be at most 45 characters')
    )
    .min(1, 'Provide at least one IP address')
    .max(50, 'A batch can contain at most 50 IP addresses'),
});

/**
 * `zValidator` hook that answers a failed parse in the API's
 * `{ error, details }` format. Without it the validator returns the ZodError
 * itself, whose JSON form is a zod internal: zod 4 folds the issues into a
 * string `message`.
 */
export const validationErrorHook = (
  result:
    | { success: true }
    | {
        success: false;
        error: {
          issues: ReadonlyArray<{
            path: readonly PropertyKey[];
            message: string;
          }>;
        };
      },
  c: Context
): Response | undefined => {
  if (result.success) return undefined;
  return c.json(
    {
      error: 'Invalid request body',
      details: result.error.issues.map(({ path, message }) => ({
        path,
        message,
      })),
    },
    400
  );
};

export type FingerprintRequest = z.infer<typeof FingerprintRequestSchema>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export type IpBatchRequest = z.infer<typeof IpBatchRequestSchema>;

/**
 * Product analytics event, built from the allowlist shared with the site
 * (`@creepjs/core/analytics-events`). Props outside the event's allowlist are
 * dropped so a newer site build can send a prop before the API knows it; a
 * known prop with a bad value is rejected as a broken or hostile client.
 */
export const AnalyticsEventRequestSchema = z
  .object({
    name: z.string(),
    path: z.string().max(2048).optional(),
    props: z.record(z.string(), z.unknown()).optional(),
  })
  .transform((event, ctx) => {
    if (!isAnalyticsEventName(event.name)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Unknown event',
        path: ['name'],
      });
      return z.NEVER;
    }

    const path =
      event.path === undefined ? '' : normalizeAnalyticsPath(event.path);
    if (path === null) {
      ctx.addIssue({ code: 'custom', message: 'Invalid path', path: ['path'] });
      return z.NEVER;
    }

    const spec = ANALYTICS_EVENTS[event.name];
    const given = event.props ?? {};
    const props: Partial<Record<AnalyticsPropName, string>> = {};
    for (const prop of [...spec.required, ...spec.optional]) {
      const value = given[prop];
      if (value === undefined) {
        if ((spec.required as readonly string[]).includes(prop)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Missing prop',
            path: ['props', prop],
          });
        }
        continue;
      }
      if (!isValidAnalyticsPropValue(prop, value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid prop value',
          path: ['props', prop],
        });
        continue;
      }
      props[prop] = value;
    }

    return { name: event.name, path, props };
  });

export type AnalyticsEventRequest = z.output<
  typeof AnalyticsEventRequestSchema
>;
