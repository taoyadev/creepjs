/**
 * Returns the WebKit Private Click Measurement source identifier if available.
 */
export function collectPrivateClickMeasurement(): string | undefined {
  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function'
  ) {
    return undefined;
  }

  try {
    const link = document.createElement('a') as HTMLAnchorElement & {
      attributionSourceId?: string;
      attributionsourceid?: string;
    };
    const supportsAttribution =
      'attributionSourceId' in link || 'attributionsourceid' in link;
    if (!supportsAttribution) {
      return undefined;
    }
    const sourceId = link.attributionSourceId ?? link.attributionsourceid;
    return sourceId === undefined ? undefined : String(sourceId);
  } catch (error) {
    void error;
    return undefined;
  }
}
