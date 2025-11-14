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

export type FingerprintRequest = z.infer<typeof FingerprintRequestSchema>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
