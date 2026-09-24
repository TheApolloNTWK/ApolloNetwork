import type { APIRoute } from 'astro';
import { absolute } from '../lib/url';

// Note: on a GitHub Pages *project* site, crawlers read robots.txt from the
// domain root (owner.github.io/robots.txt), not from this base path. This file
// becomes authoritative once the site moves to its own domain; until then the
// sitemap is best submitted directly in search consoles.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml', site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
