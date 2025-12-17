export function collectMonochromeDepth(): number | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  for (let depth = 0; depth <= 10; depth += 1) {
    if (window.matchMedia(`(monochrome: ${depth})`).matches) {
      return depth;
    }
  }

  return undefined;
}
