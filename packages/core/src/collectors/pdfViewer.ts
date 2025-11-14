/**
 * Flags whether the built-in PDF viewer is enabled.
 */
export function collectPdfViewerEnabled(): boolean | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const pdfEnabled = (navigator as Navigator & { pdfViewerEnabled?: boolean })
    .pdfViewerEnabled;
  return typeof pdfEnabled === 'boolean' ? pdfEnabled : undefined;
}
