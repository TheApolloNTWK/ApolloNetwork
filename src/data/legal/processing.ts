/**
 * Register of how personal data is handled TODAY. The Privacy Policy is
 * rendered from this list, so it can only describe what is recorded here.
 *
 * Add an entry only when a feature that processes personal data is live.
 * Remove or amend entries when behaviour changes. Never list future plans.
 * See docs/LEGAL.md for the review checklist that must accompany a change.
 */

export interface ProcessingActivity {
  id: string;
  /** What the visitor does, in plain words. */
  activity: string;
  /** What personal data is involved. */
  data: string;
  /** Why it is used. */
  purpose: string;
  /** UK GDPR lawful basis, or who decides it when it is not us. */
  basis: string;
  /** Who else receives or hosts it. */
  recipients: { name: string; role: string; policy: string }[];
  /** How long it is kept — only what is actually known. */
  retention: string;
}

const github = {
  name: 'GitHub',
  role: 'hosts this website and the public enquiry and security-report channels',
  policy:
    'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
};

const google = {
  name: 'Google (Gmail)',
  role: 'provides the APOLLO Network email inbox',
  policy: 'https://policies.google.com/privacy',
};

export const processing: ProcessingActivity[] = [
  {
    id: 'visiting',
    activity: 'Visiting this website',
    data: 'Your IP address and standard request information, logged by the hosting provider.',
    purpose: 'Keeping the hosting service secure. APOLLO Network does not receive these logs.',
    basis:
      'Decided by GitHub as the provider of GitHub Pages, under its own privacy statement. APOLLO Network does not access or use this data.',
    recipients: [github],
    retention: 'Set by GitHub. APOLLO Network does not hold a copy.',
  },
  {
    id: 'email',
    activity: 'Emailing APOLLO Network',
    data: 'Your email address, your name if you give it, and anything you write or attach.',
    purpose: 'Reading and replying to your message, and discussing work you ask about.',
    basis:
      'Legitimate interests in responding to people who contact us; where you ask about a project, taking steps at your request before any agreement.',
    recipients: [google],
    retention:
      'No fixed period has been set yet. Messages are kept only as long as needed to deal with your enquiry and any resulting work, and deleted when no longer needed or on request where possible.',
  },
  {
    id: 'github-enquiry',
    activity: 'Opening a public enquiry on GitHub',
    data: 'Your GitHub username and profile, and whatever you write. Public enquiries can be read by anyone.',
    purpose: 'Reading and replying to your enquiry, and removing spam or abuse.',
    basis: 'Legitimate interests in responding to enquiries you choose to make in public.',
    recipients: [github],
    retention:
      'Stays on GitHub until you or APOLLO Network edit or delete it, subject to GitHub’s own policies.',
  },
  {
    id: 'security-report',
    activity: 'Reporting a security issue privately on GitHub',
    data: 'Your GitHub username and the contents of your report.',
    purpose: 'Investigating and fixing the issue, and keeping a record of what was fixed.',
    basis: 'Legitimate interests in keeping this website and its visitors secure.',
    recipients: [github],
    retention:
      'Kept for as long as needed to resolve the issue and maintain a record of security fixes.',
  },
];
