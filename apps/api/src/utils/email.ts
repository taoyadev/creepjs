/**
 * Collapse the addresses that reach one inbox onto a single identity.
 *
 * Quota used to be keyed by token, so minting N tokens multiplied the daily
 * allowance by N. Keying it by the inbox instead only helps if the obvious
 * variations of one address resolve to the same key.
 */
export function normalizeEmailIdentity(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return trimmed;

  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  // Sub-addressing: delivered to the base address by every major provider.
  const plus = local.indexOf('+');
  if (plus > 0) local = local.slice(0, plus);

  // Dots are only insignificant on Gmail; other providers treat them as part
  // of the address, so stripping them everywhere would merge real inboxes.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.replaceAll('.', '')}@gmail.com`;
  }

  return `${local}@${domain}`;
}
