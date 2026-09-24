/**
 * Content for the on-site APOLLO assistant.
 *
 * This is a guided helper, not an AI: every answer is written here, runs
 * entirely in the visitor's browser and sends nothing anywhere. See
 * docs/ASSISTANT.md for the architecture required before connecting a real
 * model (server-side route, rate limits, privacy disclosure).
 *
 * Keep answers short, factual and consistent with the rest of the site.
 */

export interface AssistantLink {
  label: string;
  /** Site-relative path, e.g. 'services/#web'. */
  href: string;
}

export interface AssistantTopic {
  id: string;
  /** What the visitor taps. */
  prompt: string;
  /** The assistant's reply. */
  answer: string;
  links: AssistantLink[];
}

export const assistantGreeting = 'What can I help you with today?';

export const assistantTopics: AssistantTopic[] = [
  {
    id: 'website',
    prompt: 'I need a website',
    answer:
      'APOLLO Network designs and builds fast, accessible, secure websites — like this one — that are cheap to host and easy to maintain. Tell us what the site needs to do and who it is for.',
    links: [
      { label: 'Website services', href: 'services/#web' },
      { label: 'Start an enquiry', href: 'contact/' },
    ],
  },
  {
    id: 'software',
    prompt: 'Software or a SaaS tool',
    answer:
      'Custom software and SaaS tools built around a real need — from internal tools to writing aids — with a person accountable for every line.',
    links: [
      { label: 'Software & SaaS', href: 'services/#software' },
      { label: 'Start an enquiry', href: 'contact/' },
    ],
  },
  {
    id: 'leads',
    prompt: 'Finding new leads',
    answer:
      'Our Lead Finder tooling looks for local businesses that could use what you offer — including ones with little or no web presence.',
    links: [
      { label: 'Lead finding', href: 'services/#leads' },
      { label: 'About Lead Finder', href: 'portfolio/#lead-finder' },
    ],
  },
  {
    id: 'ai',
    prompt: 'Help using AI',
    answer:
      'Practical, plain-English help: which AI tools fit your work, how to use them safely, and where they are not worth the effort.',
    links: [
      { label: 'AI guidance', href: 'services/#ai' },
      { label: 'Start an enquiry', href: 'contact/' },
    ],
  },
  {
    id: 'automation',
    prompt: 'Automating repetitive work',
    answer:
      'Rules-heavy, repetitive work can often be handed to software — with people kept in charge of the decisions that matter.',
    links: [
      { label: 'Workflow & AI automation', href: 'services/#automation' },
      { label: 'Start an enquiry', href: 'contact/' },
    ],
  },
  {
    id: 'cost',
    prompt: 'How much does it cost?',
    answer:
      'There are no fixed packages. Each project is scoped in writing and priced before any work begins, so you know exactly what you are paying for.',
    links: [
      { label: 'How engagements work', href: 'services/#process-title' },
      { label: 'Ask for a quote', href: 'contact/' },
    ],
  },
  {
    id: 'application',
    prompt: 'What is the APOLLO application?',
    answer:
      'Our flagship project: a personal intelligence environment. It is a real, working system in private development — not available to download yet.',
    links: [
      { label: 'The application', href: 'application/' },
      { label: 'The vision', href: 'application/vision/' },
    ],
  },
  {
    id: 'person',
    prompt: 'Talk to a person',
    answer:
      'Of course. The contact page has an enquiry form that opens in your own email app, the email address, and a public option on GitHub.',
    links: [{ label: 'Contact', href: 'contact/' }],
  },
];
