import { z } from 'zod';
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
  collectors: z.record(CollectorSummarySchema).optional(),
  timings: z.record(z.number()).optional(),
});

export const TokenRequestSchema = z.object({
  email: z.string().email(),
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

export type FingerprintRequest = z.infer<typeof FingerprintRequestSchema>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export type IpBatchRequest = z.infer<typeof IpBatchRequestSchema>;
