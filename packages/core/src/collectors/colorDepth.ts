/**
 * Reports the current screen color depth (bits per pixel) if available.
 */
export function collectColorDepth(): number | undefined {
  if (typeof window === 'undefined' || !window.screen) {
    return undefined;
  }

  const depth = window.screen.colorDepth ?? window.screen.pixelDepth;
  return typeof depth === 'number' && Number.isFinite(depth)
    ? depth
    : undefined;
}
