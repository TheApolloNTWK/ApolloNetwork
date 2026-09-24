# Security Policy

APOLLO Network takes the security of this website, and of anyone who visits it, seriously. Thank
you for helping keep it safe.

## Scope

This repository contains **only the public APOLLO Network website**: a static site with no
server-side code, no database, no accounts and no user data. The private APOLLO Network system
described on the site is separate, is not hosted here, and is not reachable from this website.

## Reporting a vulnerability

**Please report vulnerabilities privately. Do not open a public issue, discussion or pull request
for a security problem.**

Use GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the issue, how to reproduce it and its potential impact.

You can expect an acknowledgement within a few working days. Once the issue is understood, you
will be told what will be done and roughly when. Credit is given on request once a fix is
released.

Please act in good faith: test only against your own browser session, do not access or modify
data that is not yours, do not degrade the service for others, and give reasonable time for a fix
before any disclosure.

## What not to post publicly

Even when an issue seems minor, please keep the following out of public issues, discussions,
commits and pull requests:

- Details or proof-of-concept code for an unfixed vulnerability
- Credentials, tokens or keys of any kind — even expired ones, and even if you found them here
- Personal data, including your own
- Screenshots or logs that contain any of the above

If you believe a secret has been committed to this repository, report it privately as above
rather than pointing at it publicly.

## Security approach

- **Minimal attack surface.** The site is static. There is no backend, form endpoint, database,
  authentication or admin interface to attack.
- **Strict browser policy.** Every page carries a restrictive Content Security Policy, blocks
  plugins and framing of other content, and enforces Trusted Types.
- **No third parties at runtime.** Fonts, scripts and images are served from the site itself.
  There are no analytics, trackers or external scripts.
- **Supply-chain care.** Few dependencies, exact versions, a lockfile, automated updates,
  dependency auditing in CI and GitHub Actions pinned to commit hashes.
- **Automated checks.** Every build is tested for unsafe markup, unsafe script patterns and
  accidentally committed secrets before it can be deployed.

## Supported versions

Only the currently deployed version of the site is supported.
