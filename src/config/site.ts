/**
 * Site-wide configuration. Everything in this file ships to the public build —
 * never place credentials, private endpoints or personal data here.
 */

export const site = {
  name: 'APOLLO Network',
  shortName: 'APOLLO',
  tagline: 'Websites, Software, AI & Automation',
  description:
    'APOLLO Network builds websites, software and AI-powered tools — including lead finding and automation — for businesses that want technology they understand and control.',
  locale: 'en_GB',
  lang: 'en-GB',
  themeColor: '#03050b',
  /** Public GitHub organisation for the project. */
  github: 'https://github.com/TheApolloNTWK',
  repository: 'https://github.com/TheApolloNTWK/ApolloNetwork',
} as const;

/**
 * Contact configuration.
 *
 * `email` is the public business address. It is never written into the HTML
 * as plain text: it is split here, stored reversed in the page, and
 * reassembled in the browser only when the visitor asks for it (see
 * src/scripts/contact.ts). Set it to null to fall back to the public GitHub
 * channels only, so no visitor is ever offered a route that does not work.
 */
export const contact: { email: { user: string; domain: string } | null } = {
  email: { user: 'apollobusinessventures', domain: 'gmail.com' },
};

export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation. `href` values are relative to the site base path. */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '' },
  { label: 'Services', href: 'services/' },
  { label: 'Portfolio', href: 'portfolio/' },
  { label: 'Application', href: 'application/' },
  { label: 'About', href: 'about/' },
];

export const contactNav: NavItem = { label: 'Contact', href: 'contact/' };

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Explore',
    items: [
      { label: 'Home', href: '' },
      { label: 'Services', href: 'services/' },
      { label: 'Portfolio', href: 'portfolio/' },
    ],
  },
  {
    heading: 'APOLLO',
    items: [
      { label: 'The application', href: 'application/' },
      { label: 'About', href: 'about/' },
      { label: 'Contact', href: 'contact/' },
    ],
  },
  {
    heading: 'Legal & trust',
    items: [
      { label: 'Privacy', href: 'privacy/' },
      { label: 'Terms', href: 'terms/' },
      { label: 'Cookies', href: 'cookies/' },
      { label: 'Accessibility', href: 'accessibility/' },
      { label: 'Security', href: 'security/' },
    ],
  },
];
