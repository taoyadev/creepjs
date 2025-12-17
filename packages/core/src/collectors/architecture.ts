/**
 * Detects CPU architecture quirks via IEEE 754 NaN sign bit behaviour.
 */
export function collectArchitectureFingerprint(): number | undefined {
  if (
    typeof Float32Array === 'undefined' ||
    typeof Uint8Array === 'undefined'
  ) {
    return undefined;
  }

  try {
    const floats = new Float32Array(1);
    const bytes = new Uint8Array(floats.buffer);
    floats[0] = Infinity;
    floats[0] = floats[0] - floats[0];
    return bytes[bytes.length - 1];
  } catch (error) {
    void error;
    return undefined;
  }
}
