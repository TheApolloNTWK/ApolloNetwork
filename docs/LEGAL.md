# Legal, privacy and trust — internal guide

Internal documentation for maintaining the website's legal and trust pages. **This is not legal
advice**, and nothing here has been reviewed by a solicitor. Items that need professional review
are listed at the end.

Guiding rule: **describe what APOLLO Network actually does today; make the structure ready for what
it may do tomorrow.** Never publish future plans as current processing, and never add placeholder
company details.

## How it is built

| Piece                   | File                                                        | Role                                                                                    |
| ----------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Legal facts             | `src/config/legal.ts`                                       | Operator description, location, governing law, regulator link, page dates               |
| Contact address         | `src/config/site.ts` (`contact.email`)                      | Single source for the business email (swap for a domain address later)                  |
| Processing register     | `src/data/legal/processing.ts`                              | Every way personal data is handled today. The Privacy Policy renders from it            |
| Device-storage register | `src/data/legal/storage.ts`                                 | Everything stored on visitors' devices (empty today). The Cookie Policy renders from it |
| Layout                  | `src/layouts/LegalLayout.astro`                             | Shared intro, last-updated date, summary, "On this page" index                          |
| Pages                   | `src/pages/{privacy,terms,cookies,accessibility,security}/` | Public legal and trust pages, linked from the footer                                    |
| Font licences           | `public/licenses/`                                          | SIL OFL texts for the self-hosted typefaces                                             |
| Repository policy       | `SECURITY.md`                                               | GitHub's security policy for private vulnerability reporting                            |

Automated tests (`tests/build.test.mjs`, "legal and trust") fail the build if:

- client code uses cookies or device storage while the storage register is empty;
- a cookie-consent banner appears while nothing requires consent;
- a legal page lacks a last-updated date, contact route, description or index;
- a legal page mentions a company suffix, company number, registered office, VAT number, DPO,
  certification or solicitor review;
- the Privacy Policy omits a recipient named in the processing register;
- any page's footer is missing a legal link or the copyright notice;
- an open-source licence file appears in the repository.

## Current audit (24 September 2026)

Verified against the production build:

- **Collected by the site:** nothing. No cookies, localStorage, sessionStorage, IndexedDB, analytics,
  fingerprinting, or network requests from client code (`connect-src 'none'`).
- **Third parties loaded:** none. Fonts, scripts and images are self-hosted.
- **Hosting:** GitHub Pages. GitHub documents that it logs visitor IP addresses for security
  purposes. APOLLO Network does not receive these logs.
- **User input:** the contact composer (name, topic, message) stays in the browser and is handed to
  the visitor's own email app via `mailto:`; nothing is submitted. The assistant is pre-written and
  sends nothing.
- **Channels that do carry personal data:** email to the Gmail inbox; public GitHub enquiries; GitHub
  private vulnerability reports.
- **External links:** GitHub, GitHub Docs, Google's privacy policy, and the ICO complaints page —
  all `https`, `rel="noopener noreferrer"`, with `Referrer-Policy: no-referrer`.

Re-run this audit whenever a script, embed, form, storage use or third-party service is added.

## Decisions already made

- **No cookie banner.** Nothing is stored on devices, so there is nothing to consent to. A banner
  would be misleading.
- **The assistant stores nothing.** Its "greeting seen" flag was removed rather than argued into
  a PECR exemption; the greeting now appears only on the home page.
- **No standalone Acceptable Use Policy.** Website misuse rules are in the Terms of Use ("What you
  must not do"). Introduce a dedicated AUP when there are accounts, SaaS tools, an API, uploads or
  an AI chatbot that people can misuse.
- **No separate copyright page.** The Terms of Use "Intellectual property" section plus the footer
  notice cover the current site. The repository stays unlicensed; public visibility is not an
  open-source licence.
- **Copyright year** is computed at build time, and the deploy workflow rebuilds on 1 January.

## Review triggers — before a feature goes live

Update the listed documents **before** launch, add or amend register entries, bump the `updated`
dates in `src/config/legal.ts`, and re-run the audit above.

### Contact form that submits data (instead of `mailto:`)

- Privacy: new processing entry — form processor, fields, purpose, retention, spam protection.
- Security: server-side validation, rate limiting, abuse handling. CSP `form-action` change for one
  origin only.
- Cookies: check whether any anti-spam service sets cookies or needs consent.

### Website AI assistant or chatbot

See also `docs/ASSISTANT.md` for the technical and abuse controls. It is **not production-ready**
until every item below is done:

- [ ] Clear on-screen disclosure that the visitor is talking to an AI, before the first message.
- [ ] Privacy: what is sent, to which provider(s) and sub-processors, purpose, lawful basis.
- [ ] Whether conversations are stored, where, for how long, and how to request deletion.
- [ ] Whether the provider may use data for model training, and the setting chosen.
- [ ] International transfers and the safeguards relied on.
- [ ] Warning not to share sensitive personal, health, financial or confidential information.
- [ ] Statement that AI answers may be inaccurate and are not professional advice.
- [ ] Data processing terms accepted with the provider; its retention settings confirmed.
- [ ] Provider credentials only server-side; rate limits and spend caps; kill switch.
- [ ] Terms of Use: chatbot acceptable-use rules (or introduce the AUP).
- [ ] Cookies: confirm nothing is stored, or register it and gain consent where required.
- [ ] Data protection impact assessment considered (novel technology, possible sensitive input).

### Analytics

- Prefer privacy-preserving, cookieless analytics. Even so, check PECR: storage or device access
  that is not strictly necessary needs **prior consent**, and declining must be as easy as accepting.
- If consent is needed: add a consent mechanism (no pre-ticked boxes, no loading before consent),
  register items in `storage.ts`, update Privacy and Cookies.
- CSP: allow only the analytics origin, and only in the directives it needs.

### User accounts

- Privacy: account data, authentication method, retention after closure, export and deletion.
- Terms: account rules, suspension and termination, user responsibilities; introduce the AUP.
- Security: authentication design (MFA, password handling or passwordless), session handling —
  this ends the "no accounts" position in `docs/SECURITY-ARCHITECTURE.md`.
- Cookies: session cookies are usually strictly necessary but must still be listed.

### Payments or subscriptions

- Commercial terms (see below), including cancellation and refunds.
- Consumer law if selling to consumers: pre-contract information and cancellation rights under the
  Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, and the
  Consumer Rights Act 2015.
- Payment processor disclosure in Privacy; never handle card data directly.
- Business information displayed (see "Decisions for Corey"), tax/VAT position.

### SaaS or tools

- Product/service terms: licence to use, acceptable use, availability and support, suspension,
  liability, changes, termination.
- If processing customers' personal data on their behalf: a data processing agreement (UK GDPR
  Article 28) and a list of sub-processors.
- Status and security pages kept accurate.

### Uploads or stored content

- Ownership of uploaded content, licence to process it, prohibited content, takedown route.
- Retention and deletion, malware scanning, storage security, backups.

### Customer projects (client work)

- Written agreement per project (see below); confidentiality; who owns what is built.
- If handling client data: processor terms and security measures.
- Portfolio entries only with the client's written permission.

## Commercial terms: prepare, do not invent

No products or services are sold through the website, and the site says so. Before drafting
**Service Terms** (client projects) or **Product/SaaS Terms**, decide and document:

| Area                      | Questions to answer                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Offer and scope           | What exactly is sold? Fixed-scope projects, time-based work, retainers, subscriptions? How are changes to scope handled?        |
| Customers                 | Businesses only, or consumers too? (Consumer law adds cancellation rights and stricter rules on unfair terms.)                  |
| Price and payment         | How prices are set and quoted, deposits, milestones, invoicing, late payment, currency, VAT                                     |
| Cancellation and refunds  | What happens if either side ends the work; refunds for subscriptions; consumer cancellation periods                             |
| Ownership and IP          | Who owns code, designs and content on delivery; what APOLLO Network keeps (reusable tools, Lead Finder); open-source components |
| Licensing                 | For SaaS: licence scope, seats, restrictions                                                                                    |
| Delivery and acceptance   | How work is accepted; warranty or bug-fix period                                                                                |
| Support and availability  | Support hours, response targets, uptime commitments (only promise what can be met)                                              |
| Hosting and third parties | Who pays for and owns hosting, domains and third-party accounts                                                                 |
| Liability                 | Caps and exclusions appropriate to the work, insurance held                                                                     |
| Data protection           | Whether APOLLO Network processes client data; processor terms                                                                   |
| Confidentiality           | Mutual confidentiality, portfolio rights                                                                                        |
| Law and disputes          | Governing law, jurisdiction, dispute resolution                                                                                 |

Once decided, add pages (for example `/terms/services/`), register them in `src/config/legal.ts`,
and link them from the Terms of Use and footer.

## Decisions for Corey

1. **Business identity and address.** The Electronic Commerce (EC Directive) Regulations 2002
   generally require a business website to show the provider's name and a **geographic address**
   (not just email). If APOLLO Network trades as a sole trader under a business name, UK
   business-names rules also require the owner's name and an address for service to be available.
   Decide what legal name and address to publish (a registered-office or business-address service is
   a common option), then add them to `src/config/legal.ts` and the Terms and Privacy pages.
2. **Legal form.** Sole trader, partnership or company? Update `operatorDescription` if a company is
   formed, and add its registered details.
3. **ICO data protection fee.** Most organisations processing personal data must pay the ICO fee
   unless exempt. Check the ICO's fee self-assessment and record the outcome.
4. **Email retention period.** The policy currently says no fixed period has been set. Choose one
   (for example, delete enquiries that do not lead to work after a set time).
5. **Governing law.** The Terms name Northern Ireland; confirm.
6. **Domain email.** Replace the Gmail address with a domain address when available: change
   `contact.email` and the Google entry in `processing.ts` if the provider changes.
7. **GitHub private vulnerability reporting.** Enable it in the repository settings; the Security page
   depends on it.

## For professional legal review

When there is budget, or before selling products or services online:

- Privacy Policy (lawful bases, retention, transfers wording) and the ICO fee position.
- Terms of Use liability and governing-law clauses.
- E-Commerce Regulations and business-names disclosures.
- All future commercial terms (services, SaaS, subscriptions), especially if selling to consumers.
- The AI assistant disclosures and provider terms before it launches.
- Any data processing agreements with clients or providers.
