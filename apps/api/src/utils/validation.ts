import { z } from 'zod';

const CollectorSummarySchema = z.object({
  status: z.enum(['success', 'error']),
  duration: z.number(),
  value: z.unknown().optional(),
  error: z.string().optional(),
});

export const FingerprintRequestSchema = z.object({
  fingerprintId: z.string(),
  data: z.object({
    canvas: z
      .object({
        hash: z.string(),
        dataURL: z.string().optional(),
      })
      .optional(),
    webgl: z
      .object({
        vendor: z.string(),
        renderer: z.string(),
        version: z.string(),
        shadingLanguageVersion: z.string(),
        unmaskedVendor: z.string().optional(),
        unmaskedRenderer: z.string().optional(),
        parameters: z.record(z.unknown()).optional(),
      })
      .optional(),
    navigator: z
      .object({
        userAgent: z.string(),
        language: z.string(),
        languages: z.array(z.string()),
        platform: z.string(),
        hardwareConcurrency: z.number(),
        deviceMemory: z.number().optional(),
        maxTouchPoints: z.number(),
        vendor: z.string(),
        cookieEnabled: z.boolean(),
        doNotTrack: z.string().nullable(),
      })
      .optional(),
    screen: z
      .object({
        width: z.number(),
        height: z.number(),
        availWidth: z.number(),
        availHeight: z.number(),
        colorDepth: z.number(),
        pixelDepth: z.number(),
        devicePixelRatio: z.number(),
      })
      .optional(),
    fonts: z
      .object({
        available: z.array(z.string()),
        count: z.number(),
      })
      .optional(),
    domBlockers: z
      .object({
        detected: z.array(z.string()),
      })
      .optional(),
    fontPreferences: z
      .object({
        serif: z.string().optional(),
        sansSerif: z.string().optional(),
        monospace: z.string().optional(),
      })
      .optional(),
    colorGamut: z.enum(['srgb', 'p3', 'rec2020']).optional(),
    contrast: z.enum(['more', 'less', 'custom', 'no-preference']).optional(),
    forcedColors: z
      .object({
        active: z.boolean(),
      })
      .optional(),
    monochrome: z.number().optional(),
    reducedMotion: z.enum(['reduce', 'no-preference']).optional(),
    reducedTransparency: z.enum(['reduce', 'no-preference']).optional(),
    hdr: z.enum(['high', 'standard']).optional(),
    audioBaseLatency: z
      .object({
        supported: z.boolean(),
        baseLatency: z.number().optional(),
        outputLatency: z.number().optional(),
        sampleRate: z.number().optional(),
      })
      .optional(),
    applePay: z
      .object({
        isSupported: z.boolean(),
        canMakePayments: z.boolean().optional(),
        supportedVersions: z.array(z.number()).optional(),
      })
      .optional(),
  }),
  timestamp: z.number(),
  confidence: z.number(),
  collectors: z.record(CollectorSummarySchema).optional(),
  timings: z.record(z.number()).optional(),
});

export const TokenRequestSchema = z.object({
  email: z.string().email(),
});

export type FingerprintRequest = z.infer<typeof FingerprintRequestSchema>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
