# Quality assurance

How the site is checked before release, and what has and has not been verified. Automated checks
that run on every build are in `tests/`; the browser checks below were run manually from a
disposable environment and are not project dependencies.

## Every build (CI)

`npm run verify` — Prettier, ESLint (including accessibility rules), `astro check`, production
build, and the tests in `tests/`:

- routing and links under the `/ApolloNetwork/` base path, anchors, sitemap, robots, manifest;
- metadata (title, description, canonical, Open Graph) on every page;
- the Content Security Policy is present and strict, with no inline handlers or `style` attributes;
- no source maps, `eval`, HTML-injection sinks or network calls in client code; JS size budget;
- a leak scan of the repository and build output (credentials, private IPs, local paths);
- content integrity: brand language, no invented metrics, testimonials or pricing, unreleased work
  labelled, no contact form that cannot deliver.

## Browser matrix (release checks)

Run against the production build served by a GitHub Pages emulator (site under `/ApolloNetwork/`,
real 404 status, directory redirects, gzip), over HTTPS so the production CSP applies unmodified.

| Engine          | Build used                                             |
| --------------- | ------------------------------------------------------ |
| Chromium        | Playwright's bundled Chromium                          |
| Firefox (Gecko) | Firefox 156 from conda-forge, driven by geckodriver    |
| WebKit          | WebKitGTK 2.52 (MiniBrowser) driven by WebKitWebDriver |

Viewports: 1920×1080, 1366×768, 1024×768, 768×1024, 390×844, 320×568 — on every page including
the 404. Each run checks horizontal overflow, script initialisation, hero canvas readiness, a
single `h1`, scroll-reveal completion, touch-target size (24 px minimum, WCAG 2.2 AA) and console
errors, and captures screenshots.

Also checked: keyboard order, skip link, focus visibility, mobile menu (open, focus trap, Escape,
focus return), reduced motion (static canvas, nothing hidden, no running animations), no-JavaScript
rendering, deep links to anchors, axe-core (WCAG 2.2 AA + best practice) in Chromium and Firefox,
and Lighthouse.

## Known limits of this testing

- **WebKitGTK is not Safari.** It shares the WebKit engine, but not Safari's shell, fonts, scrolling
  physics or iOS behaviour. Real Safari on macOS and iOS has not been tested.
- **No physical devices.** Mobile checks use viewport sizes, not real phones or tablets, touch
  input, notches, or mobile GPU performance.
- WebKitGTK under a virtual display does not grant keyboard focus to small automation windows, so
  `:focus-visible` could only be confirmed there at desktop size (a harness limitation reproduced
  with a blank test page).
- Lighthouse runs use simulated throttling on a server, not real networks.

## Before each public release

1. `npm run verify`
2. Open the deployed site on a real iPhone (Safari) and an Android phone: navigation menu, hero,
   scrolling, every page.
3. Check Safari on macOS with keyboard navigation (enable _Press Tab to highlight each item_).
4. `curl -sI https://theapollontwk.github.io/ApolloNetwork/` to confirm HTTPS and headers.
