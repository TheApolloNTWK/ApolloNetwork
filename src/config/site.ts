/**
 * Site-wide configuration. Everything in this file ships to the public build —
 * never place credentials, private endpoints or personal data here.
 */

export const site = {
  name: 'APOLLO Network',
  shortName: 'APOLLO',
  tagline: 'Personal Intelligence Environment',
  description:
    'APOLLO Network is building a personal intelligence environment: one place to configure and work with AI models, agents, tools and memory — under your control.',
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
 * `email` is deliberately null until a dedicated public address exists. While
 * it is null, the contact page shows the public GitHub channel instead of an
 * enquiry composer, so no visitor is ever told a message was sent when it was
 * not. When set, the address is never written into the HTML as plain text;
 * it is split here and reassembled in the browser only when the visitor asks
 * for it (see src/scripts/contact.ts).
 *
 * Example: email: { user: 'hello', domain: 'example.com' }
 */
export const contact: { email: { user: string; domain: string } | null } = {
  email: null,
};

export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation. `href` values are relative to the site base path. */
export const primaryNav: NavItem[] = [
  { label: 'Environment', href: 'environment/' },
  { label: 'Project', href: 'project/' },
  { label: 'Work', href: 'work/' },
  { label: 'About', href: 'about/' },
];

export const contactNav: NavItem = { label: 'Contact', href: 'contact/' };

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Explore',
    items: [
      { label: 'Home', href: '' },
      { label: 'The environment', href: 'environment/' },
      { label: 'The project', href: 'project/' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'Work with us', href: 'work/' },
      { label: 'About', href: 'about/' },
      { label: 'Contact', href: 'contact/' },
    ],
  },
  {
    heading: 'Legal',
    items: [{ label: 'Privacy', href: 'privacy/' }],
  },
];
