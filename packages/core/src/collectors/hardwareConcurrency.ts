/**
 * Reports the number of logical processor cores if available.
 */
export function collectHardwareConcurrency(): number | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const value = (
    navigator as Navigator & { hardwareConcurrency?: number | string }
  ).hardwareConcurrency;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed)
    ? parsed
    : undefined;
}
