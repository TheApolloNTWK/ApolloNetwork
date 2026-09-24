# APOLLO Network

A Personal Intelligence Environment. **Understand. Build. Execute.**

This repository contains the **public website** for APOLLO Network. The private APOLLO system it
describes is not part of this repository and must never be added to it.

Live site (once deployed): <https://theapollontwk.github.io/ApolloNetwork/>

---

## Stack

| Concern   | Choice                                                  | Why                                                                                                                |
| --------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework | [Astro](https://astro.build) 7, static output           | Ships HTML and CSS by default and only the JavaScript a page asks for. Built-in CSP hashing and font optimisation. |
| Language  | TypeScript (strictest), plain CSS                       | No UI framework or CSS framework is needed for a site of this size.                                                |
| Fonts     | Inter and Space Grotesk, self-hosted from npm           | No third-party requests; metric-matched fallbacks avoid layout shift.                                              |
| Motion    | CSS, CSS scroll-driven animations, one Canvas 2D script | No animation library; everything respects `prefers-reduced-motion`.                                                |
| Tests     | Node's built-in test runner                             | No test framework dependency.                                                                                      |
| Hosting   | GitHub Pages via GitHub Actions                         | Static, no server to maintain or attack.                                                                           |

Runtime dependencies shipped to visitors: **none**. All packages are build-time only.

## Project structure

```
src/
  config/site.ts        Site name, navigation, public links, contact configuration
  data/                 Page content as typed data (services, work, principles, project layers)
  layouts/BaseLayout    Document shell: head, metadata, header, footer
  components/           Reusable components (Button, SectionHeading, EnvironmentMap, …)
    home/               Home-page-only sections (Hero, Triad, ApplicationBand)
  pages/                One file per route; sitemap.xml, robots.txt and site.webmanifest endpoints
  scripts/              Client scripts: motion system, header menu, hero canvas, contact composer
  styles/
    tokens.css          Design tokens — colour, type, space, radius, glow, motion, breakpoints
    base.css            Reset, typography, focus, reveal system, reduced-motion rules
    patterns.css        Shared layout patterns (split, spec list, stack)
  assets/               Build-processed assets (grain texture)
public/                 Files served as-is (favicons, social image)
tests/                  Build-output and leak-scan tests
docs/                   Security architecture and platform limitations
```

### Adding content

- **A service** — add an entry to `services` in `src/data/work.ts`. It appears on the home page
  and the Services page, with an anchor link.
- **A portfolio item** — add to `selectedWork` in `src/data/work.ts`. It appears on the home page
  and the Portfolio page. Only real, showable work.
- **An assistant answer** — add a topic to `src/data/assistant.ts`.
- **A page** — create `src/pages/<name>/index.astro` using `BaseLayout` and `PageIntro`; add it to
  `src/data/routes.ts` (sitemap) and, if it belongs in navigation, `src/config/site.ts`. Always
  link internally with `link()` from `src/lib/url.ts` so the base path is respected.
- **Future or unreleased capability** — label it with `<StatusTag status="future" />` (or
  `exploring` / `private`). Never present unreleased work as available.

### Design system

All visual values come from `src/styles/tokens.css`. Use the tokens rather than new literal values.
Breakpoints are documented at the top of that file (480 / 768 / 1024 / 1280 / 1600 px). Text
colour tokens are annotated with their measured contrast ratios.

## Local development

Requires Node.js 22.12 or later (see `.nvmrc`).

```sh
npm ci --ignore-scripts   # install exactly what the lockfile specifies
npm run dev               # http://localhost:4321/ApolloNetwork/
```

| Command              | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `npm run build`      | Production build to `dist/`                               |
| `npm run preview`    | Serve `dist/` locally under the base path                 |
| `npm run lint`       | ESLint (including accessibility rules) and Prettier check |
| `npm run format`     | Apply Prettier formatting                                 |
| `npm run check`      | Astro and TypeScript diagnostics                          |
| `npm test`           | Tests against `dist/` — run after `npm run build`         |
| `npm run verify`     | Everything above, in order                                |
| `npm run audit:deps` | `npm audit`                                               |

To disable Astro's anonymous telemetry locally: `npx astro telemetry disable` (CI sets
`ASTRO_TELEMETRY_DISABLED=1`).

> **Previewing in Safari:** the Content Security Policy includes `upgrade-insecure-requests`.
> WebKit applies it to plain-`http` local servers (Chromium and Firefox exempt `localhost`), so
> an `http://` preview in Safari may load unstyled. Preview in another browser, or serve `dist/`
> over HTTPS. Production is always HTTPS, where the directive has no visible effect.

## Deployment

Deployment is automatic on every push to `main` via `.github/workflows/deploy.yml`, which lints,
type-checks, builds, tests and then publishes `dist/` to GitHub Pages.

**One-time setup** (repository settings):

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
2. **Settings → Pages:** tick **Enforce HTTPS** once the certificate is issued.
3. **Settings → Code security:** enable **Private vulnerability reporting**, **Dependabot alerts**
   and **Dependabot security updates**. Secret scanning and push protection are recommended.
4. Optionally protect `main` so changes arrive through pull requests that pass the CI workflow.
5. Keep **Issues** enabled: the Contact page uses the public enquiry form in
   `.github/ISSUE_TEMPLATE/` until a business email is configured. Optionally create the
   `enquiry` and `website` labels the forms apply.

### Base path

The site is built for `https://theapollontwk.github.io/ApolloNetwork/`. During deployment the
workflow reads the real URL from GitHub Pages and passes it to the build as `SITE_ORIGIN` and
`SITE_BASE`, so moving to a custom domain needs no code change: add the domain in Pages settings
and the next deployment builds for the root path. For a local build with different values:

```sh
SITE_ORIGIN=https://example.com SITE_BASE= npm run build
```

## Site structure

| Route                               | Purpose                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `/`                                 | APOLLO Network as a business: what it offers, selected work, how it works |
| `/services/`                        | Services and how engagements run                                          |
| `/portfolio/`                       | Real work, labelled honestly (a work in progress)                         |
| `/application/`                     | The APOLLO Network Application — the personal intelligence environment    |
| `/application/vision/`              | Where the public application is going (future direction)                  |
| `/about/`, `/contact/`, `/privacy/` | Company, contact channels, privacy                                        |

## Contact configuration

`contact.email` in `src/config/site.ts` holds the public business address. The Contact page then
offers the enquiry composer (prepares a message in the visitor's own email app — nothing is sent
through the site), the email address on request, a **public enquiry** via the GitHub issue form
(`.github/ISSUE_TEMPLATE/enquiry.yml`), and the GitHub profile. The address is stored reversed in
the page and assembled in the browser only when asked for, so it never appears in the HTML in plain
form; a test enforces this. Set `contact.email` to `null` to fall back to the GitHub channels only.

## Website assistant

Every page has the **APOLLO assistant**: a guided helper that answers common questions and routes
visitors to the right page. It is not an AI and sends nothing anywhere. See
[`docs/ASSISTANT.md`](docs/ASSISTANT.md) for how it works and the security, privacy and cost
controls required before connecting a real AI model.

## Security and privacy

- See [`SECURITY.md`](SECURITY.md) to report a vulnerability.
- See [`docs/SECURITY-ARCHITECTURE.md`](docs/SECURITY-ARCHITECTURE.md) for the controls in place,
  what GitHub Pages cannot enforce, and the migration path for full header control.
- The site sets no cookies and loads no analytics or third-party scripts. Nothing is stored on
  visitors' devices. If privacy-preserving analytics are
  ever added, update the Privacy page and CSP in the same change.

## Brand assets

The logo mark, favicon set and social image are interim artwork. See
[`docs/BRAND-ASSETS.md`](docs/BRAND-ASSETS.md) for every asset's location, required format and
size, and the replacement steps.

## Legal and trust pages

Privacy, Terms, Cookies, Accessibility and Security pages live under `src/pages/` and are linked from
the footer. Their facts come from `src/config/legal.ts` and the registers in `src/data/legal/`. Read
[`docs/LEGAL.md`](docs/LEGAL.md) before adding any feature that collects data, stores anything on
visitors' devices, adds a third party, or sells anything.

## Content rules

- The private APOLLO system is real and in active development; describe it at the level of
  concepts only (see the header comment in `src/data/project.ts` for what must never appear).
- Anything not publicly available carries a status label from `src/data/status.ts`.
- No invented metrics, clients, testimonials or pricing. `tests/build.test.mjs` checks the built
  pages for common patterns of each.
