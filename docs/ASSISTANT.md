# The APOLLO website assistant

## What ships today

A **guided helper, not an AI**. It greets visitors once per tab ("What can I help you with
today?"), offers topic choices, and answers from content written in `src/data/assistant.ts`, with
links into the site and to the contact page.

- Runs entirely in the browser. No network requests, no third-party code, no model, no API key.
- Answers are pre-rendered into `<template>` elements and cloned; no HTML strings are parsed, so
  the Content Security Policy and Trusted Types enforcement are unchanged.
- Stores one value — that the greeting was seen — in `sessionStorage` for the current tab. This is
  disclosed on the Privacy page.
- Labelled in its own header: “Guided answers — not AI. Nothing you choose leaves your browser.”
- Keyboard accessible: focus moves into the panel on open; `Escape` closes it and returns focus.
  Hidden completely when JavaScript is unavailable.

Edit `src/data/assistant.ts` to change topics and answers. Keep answers consistent with the site.

## Before connecting a real AI model

A real conversational assistant changes the site's security and privacy position: messages would
leave the visitor's browser and be processed by a server and a model provider. Do **not** add a
third-party chat widget. Build it deliberately, with at least the following.

### Architecture

```
Browser (this site)  ──HTTPS──▶  Assistant endpoint (server-side, you control)  ──▶  Model provider
   no secrets                     holds the API key as a server secret
```

- A small server-side route (for example a serverless function or edge worker) is the only thing
  that talks to the model provider. **No API key or model credential ever reaches the browser**,
  the repository, or the build output.
- GitHub Pages cannot run server code, so the endpoint lives elsewhere, on its own origin.
- The page's CSP gains exactly one change: `connect-src` allows that single origin (never `*`).

### Abuse and cost controls

- Rate limits per client (IP or token bucket) and a global daily request and spend cap, enforced
  on the server, with a kill switch that falls back to the guided helper.
- Hard limits on message length, conversation length and response size.
- Reject requests without the expected origin; consider a lightweight, privacy-respecting challenge
  if abuse appears. Avoid tracking-based bot detection.
- Budget alerts with the model provider; the server refuses when the cap is reached.

### Behaviour and safety

- A fixed system prompt scoped to APOLLO Network's public information: services, portfolio, the
  application's public description, and how to get in touch. No access to private APOLLO systems,
  memory, tools or internal data — ever.
- No tool use, browsing or actions. The assistant answers and routes to pages or the contact form.
- Treat everything the visitor types as untrusted. Render replies as text (`textContent`), never
  as HTML.
- It must say it is an AI, must not invent prices, timelines or capabilities, and should hand off
  to a person (the contact page) whenever it is unsure.

### Privacy

- Update the Privacy page first: what is sent, to which provider, retention, and purpose.
- Show a short notice before the first message is sent, and do not send anything until the
  visitor chooses to.
- Default to not storing transcripts. If any logging is needed for abuse prevention, keep it
  minimal, short-lived and free of message content where possible.
- Never ask visitors for sensitive personal data in the chat.

### Checks before launch

- Security review of the endpoint, secrets handling and CSP change.
- Load test for the rate limits and spend cap; confirm the kill switch works.
- Prompt-injection testing: the assistant must not reveal its system prompt, invent offers, or
  claim abilities it does not have.
- Accessibility review of the chat interaction (live regions, focus, reduced motion).
