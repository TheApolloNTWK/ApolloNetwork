import { contact } from '../config/site';

/**
 * The business address, prepared for the page without ever appearing in the
 * HTML as plain text: each part is stored reversed and reassembled in the
 * browser only on request (src/scripts/email.ts). Returns null when no
 * address is configured.
 */
export function obfuscatedEmail(): { u: string; d: string } | null {
  const email = contact.email;
  if (!email) return null;
  const reverse = (s: string) => [...s].reverse().join('');
  return { u: reverse(email.user), d: reverse(email.domain) };
}
