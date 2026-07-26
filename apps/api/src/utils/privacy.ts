/**
 * Privacy helpers for logs and rate-limit keys.
 *
 * Structured logs and KV keys must never contain raw lookup subjects
 * (visitor or queried IPs) — see docs/SECURITY.md data-handling matrix.
 * A truncated SHA-256 keeps entries correlatable and greppable for a
 * *known* IP without building a raw-IP corpus in logs or storage.
 */

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 12-hex-char (48-bit) stable identifier for an IP, safe to log. */
export async function hashIpForLog(ip: string): Promise<string> {
  return (await sha256Hex(ip)).slice(0, 12);
}
