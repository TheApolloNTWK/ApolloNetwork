// Shared helpers for build-output tests. Pure Node — no dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const ROOT = new URL('..', import.meta.url).pathname;
export const DIST = join(ROOT, 'dist');
export const BASE = (process.env.SITE_BASE ?? '/ApolloNetwork').replace(/\/$/, '');
export const ORIGIN = process.env.SITE_ORIGIN ?? 'https://theapollontwk.github.io';

export function walk(dir, filter = () => true) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      out.push(...walk(full, filter));
    } else if (filter(full)) {
      out.push(full);
    }
  }
  return out;
}

export function assertBuilt() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/ not found — run `npm run build` before `npm test`.');
  }
}

export const htmlFiles = () => walk(DIST, (f) => f.endsWith('.html'));
export const read = (f) => readFileSync(f, 'utf8');
export const rel = (f) => relative(ROOT, f);

/** Map a site URL path (with base) to the file that GitHub Pages would serve. */
export function resolveToFile(pathname) {
  if (!pathname.startsWith(`${BASE}/`) && pathname !== BASE) return null;
  let p = decodeURIComponent(pathname.slice(BASE.length)) || '/';
  if (p.endsWith('/')) p += 'index.html';
  const file = join(DIST, p);
  return existsSync(file) ? file : null;
}

/** Extract attribute values (href/src/content…) with a tolerant regex. */
export function attrs(html, name) {
  const re = new RegExp(`\\s${name}="([^"]*)"`, 'g');
  return [...html.matchAll(re)].map((m) => m[1].replace(/&amp;/g, '&'));
}

export function ids(html) {
  return new Set(attrs(html, 'id'));
}
