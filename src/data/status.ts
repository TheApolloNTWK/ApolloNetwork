/**
 * Honest status labels. Anything shown on the site that is not publicly
 * available today must carry one of these, so future direction is never
 * mistaken for a released capability.
 */
export type Status =
  'live' | 'private' | 'internal' | 'developing' | 'experimental' | 'exploring' | 'future';

export const statusLabel: Record<Status, string> = {
  /** Publicly available now. */
  live: 'Live',
  /** Exists and is being built, but not publicly available. */
  private: 'In private development',
  /** A real tool used within APOLLO Network, not offered publicly. */
  internal: 'Internal tool',
  /** Part of the private system that is still being built. */
  developing: 'In development',
  /** Working as an experiment, not relied upon. */
  experimental: 'Experimental',
  /** A concept under investigation. */
  exploring: 'Being explored',
  /** Planned direction for the public product. Nothing to use yet. */
  future: 'Future direction',
};
