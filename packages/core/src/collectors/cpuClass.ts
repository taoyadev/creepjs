/**
 * Returns legacy CPU class hint exposed in some browsers.
 */
export function collectCpuClass(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as Navigator & { cpuClass?: string }).cpuClass ?? undefined;
}
