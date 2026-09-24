// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

/**
 * Deployment target. GitHub Pages serves this repository as a project site at
 * https://<owner>.github.io/ApolloNetwork/, so every URL must carry the base
 * path. The deploy workflow passes SITE_ORIGIN / SITE_BASE from
 * actions/configure-pages, which keeps a future custom domain a config change.
 */
const site = process.env.SITE_ORIGIN || 'https://theapollontwk.github.io';
// An explicitly empty SITE_BASE (custom domain at the root) means "/".
const base = process.env.SITE_BASE === undefined ? '/ApolloNetwork' : process.env.SITE_BASE || '/';

const fontFile = (/** @type {string} */ pkg, /** @type {string} */ file) =>
  `./node_modules/@fontsource-variable/${pkg}/files/${file}`;

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
    // Everything the pages load comes from /_astro/ under the base path.
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  // No client-side prefetching, no dev toolbar in builds, no telemetry-driven
  // behaviour affects output. Keep the shipped runtime as small as possible.
  // No Markdown code blocks are used; Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
  prefetch: false,
  devToolbar: { enabled: false },
  vite: {
    build: {
      // Source maps are not shipped: nothing in this site needs them and they
      // enlarge the public surface for no benefit.
      sourcemap: false,
    },
  },
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.local(),
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [
          {
            src: [fontFile('inter', 'inter-latin-wght-normal.woff2')],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      name: 'Space Grotesk',
      cssVariable: '--font-grotesk',
      provider: fontProviders.local(),
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [
          {
            src: [fontFile('space-grotesk', 'space-grotesk-latin-wght-normal.woff2')],
            weight: '300 700',
            style: 'normal',
          },
        ],
      },
    },
  ],
  security: {
    /**
     * Astro hashes every inline/bundled script and style it emits and writes a
     * <meta http-equiv="Content-Security-Policy"> into each page. GitHub Pages
     * cannot send custom response headers, so the meta element is the
     * enforcement point. Directives that browsers ignore in a meta element
     * (frame-ancestors, report-uri, sandbox) are deliberately omitted — see
     * docs/SECURITY-ARCHITECTURE.md.
     */
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'none'",
        "img-src 'self'",
        "font-src 'self'",
        "manifest-src 'self'",
        "connect-src 'none'",
        "media-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "require-trusted-types-for 'script'",
        "trusted-types 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
