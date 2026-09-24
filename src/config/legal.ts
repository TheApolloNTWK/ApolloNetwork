/**
 * Facts the legal and trust pages depend on. Change them here, not in page
 * copy. Every value must be true today — see docs/LEGAL.md before editing.
 *
 * Deliberately absent until they exist and are confirmed: legal entity type,
 * company number, registered office, VAT number, Data Protection Officer,
 * ICO registration reference. Do not add placeholders for them.
 */
export const legal = {
  /** How the operator is named in policies. */
  operator: 'APOLLO Network',
  /** Plain description; must not imply incorporation. */
  operatorDescription: 'an independent technology venture',
  location: 'Northern Ireland, United Kingdom',
  /** Law chosen for the Terms of Use. Flagged for professional review in docs/LEGAL.md. */
  governingLaw: 'Northern Ireland',
  regulator: {
    name: 'Information Commissioner’s Office (ICO)',
    complaintsUrl: 'https://ico.org.uk/make-a-complaint/',
  },
  /** ISO dates. Update `updated` whenever a page's substance changes. */
  documents: {
    privacy: { title: 'Privacy Policy', path: 'privacy/', updated: '2026-09-24' },
    terms: { title: 'Terms of Use', path: 'terms/', updated: '2026-09-24' },
    cookies: { title: 'Cookie Policy', path: 'cookies/', updated: '2026-09-24' },
    accessibility: { title: 'Accessibility', path: 'accessibility/', updated: '2026-09-24' },
    security: { title: 'Security', path: 'security/', updated: '2026-09-24' },
  },
} as const;

export type LegalDocument = keyof typeof legal.documents;

/** Human-readable date, e.g. "24 September 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
