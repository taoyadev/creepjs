/**
 * Returns the reported device memory in gigabytes (rounded bucket).
 */
export function collectDeviceMemory(): number | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const raw = (navigator as Navigator & { deviceMemory?: number | string })
    .deviceMemory;
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}
