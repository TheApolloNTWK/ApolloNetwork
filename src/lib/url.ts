/**
 * URL helpers that respect the deployment base path (e.g. /ApolloNetwork/ on
 * GitHub Pages). Internal links must always go through `link()` so the site
 * works at any base without edits.
 */

const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** Resolve a site-relative path ('', 'work/', 'contact/#form') to a base-prefixed URL. */
export function link(path = ''): string {
  return `${BASE}${path.replace(/^\/+/, '')}`;
}

/** Absolute URL for canonical links, Open Graph and the sitemap. */
export function absolute(path: string, site: URL | undefined): string {
  if (!site) throw new Error('`site` must be set in astro.config.mjs');
  return new URL(link(path), site).href;
}

/** Strip the base path from a pathname so active-nav matching is base-agnostic. */
export function stripBase(pathname: string): string {
  return pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\/+/, '');
}
