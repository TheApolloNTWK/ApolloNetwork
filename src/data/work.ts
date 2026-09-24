import type { IconName } from '../components/Icon.astro';
import type { Status } from './status';

interface Evidence {
  label: string;
  /** Site-relative path, or an https:// URL when `external`. */
  path: string;
  external?: boolean;
}

export interface Service {
  id: string;
  name: string;
  icon: IconName;
  summary: string;
  examples: string[];
  /** Label for the contextual enquiry link, which pre-selects this topic on the contact page. */
  enquiry: string;
  /** Real work that demonstrates this capability, where it exists. */
  evidence?: Evidence;
}

/**
 * Areas of work APOLLO Network takes on. Keep this list to what can
 * genuinely be delivered by a small independent venture. Add a new entry
 * here to add a service everywhere it is listed.
 */
export const services: Service[] = [
  {
    id: 'web',
    name: 'Websites & digital experiences',
    icon: 'globe',
    summary:
      'Fast, accessible, secure websites with a considered visual identity — designed and built for you, cheap to host and easy to maintain.',
    examples: ['Business and brand sites', 'Redesigns', 'Accessibility and performance'],
    enquiry: 'Discuss a website',
    evidence: { label: 'Example: this website', path: 'portfolio/#website' },
  },
  {
    id: 'software',
    name: 'Software & SaaS tools',
    icon: 'code',
    summary:
      'Custom software and software-as-a-service tools built around a real need — from writing aids to internal tools — with a person accountable for every line.',
    examples: ['Web applications', 'SaaS tools', 'Writing and content tools'],
    enquiry: 'Discuss software',
  },
  {
    id: 'leads',
    name: 'Lead finding',
    icon: 'research',
    summary:
      'Finding businesses that could use what you offer — including those with little or no web presence — using APOLLO Network’s own lead-finding tools.',
    examples: ['Local-business discovery', 'Web-presence checks', 'Opportunity lists'],
    enquiry: 'Discuss lead finding',
    evidence: { label: 'Example: Lead Finder', path: 'portfolio/#lead-finder' },
  },
  {
    id: 'ai',
    name: 'AI guidance',
    icon: 'agents',
    summary:
      'Practical help using AI well: which tools fit your work, how to use them safely, and where they are not worth the effort.',
    examples: ['Choosing the right tools', 'Hands-on guidance', 'Safe, sensible use'],
    enquiry: 'Ask about AI',
  },
  {
    id: 'automation',
    name: 'Workflow & AI automation',
    icon: 'workflow',
    summary:
      'Repetitive, rules-heavy work handed to software — including AI where it genuinely helps — with people kept in charge of the decisions that matter.',
    examples: ['Multi-step workflows', 'Connecting your tools', 'Human approval steps'],
    enquiry: 'Discuss automation',
  },
  {
    id: 'experiments',
    name: 'Technical experiments & prototypes',
    icon: 'flask',
    summary:
      'A quick, honest test of whether an idea works — before anyone commits to building the whole thing.',
    examples: ['Proofs of concept', 'Feasibility checks', 'AI capability trials'],
    enquiry: 'Discuss a prototype',
  },
];

/**
 * Topics offered on the contact page. A service's id doubles as its topic, so
 * `contact/?topic=web` arrives with "A website" already selected.
 */
export const enquiryTopics = [
  { id: 'web', label: 'A website' },
  { id: 'software', label: 'Software or a SaaS tool' },
  { id: 'leads', label: 'Lead finding' },
  { id: 'ai', label: 'Help using AI' },
  { id: 'automation', label: 'Workflow or AI automation' },
  { id: 'experiments', label: 'A prototype or experiment' },
  { id: 'application', label: 'The APOLLO Network Application' },
  { id: 'other', label: 'Something else' },
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number]['id'];

export const engagementSteps = [
  {
    step: 'Conversation',
    body: 'What problem are you solving, and what would success look like? No obligation, no sales script.',
  },
  {
    step: 'Scope',
    body: 'A written proposal: what will be built, what will not, and how you will know it works.',
  },
  {
    step: 'Build',
    body: 'Delivered in visible increments you can use and question along the way.',
  },
  {
    step: 'Handover',
    body: 'Documentation, access and ownership handed to you. No lock-in by design.',
  },
] as const;

export type WorkGlyph = 'core' | 'map' | 'layout';

export interface WorkItem {
  id: string;
  title: string;
  kind: string;
  status: Status;
  summary: string;
  /** Short factual points shown on the Work page. No metrics unless verified. */
  details?: string[];
  tags: string[];
  /** Abstract illustration used on cards — never a mock screenshot. */
  glyph: WorkGlyph;
  href?: Evidence;
}

/**
 * Selected work. Only real, verifiable work belongs here — no placeholder
 * clients, no invented results. Add entries as projects can be shown.
 */
export const selectedWork: WorkItem[] = [
  {
    id: 'lead-finder',
    title: 'APOLLO Network Lead Finder',
    kind: 'Lead-finding tool',
    status: 'internal',
    summary:
      'A tool for discovering potential local-business opportunities — including businesses that may lack a website or a strong web presence — to support lead-generation work.',
    details: [
      'Built and used within APOLLO Network',
      'Finds local businesses, checks their web presence and builds opportunity lists',
    ],
    tags: ['Automation', 'Data gathering', 'Lead generation'],
    glyph: 'map',
  },
  {
    id: 'website',
    title: 'APOLLO Network website',
    kind: 'Public website',
    status: 'live',
    summary:
      'This site: a static build with a strict content security policy, no trackers, and a procedural hero drawn in a few kilobytes of code.',
    details: [
      'No cookies, analytics or third-party scripts',
      'Accessible and responsive, with reduced-motion support',
      'Source code publicly viewable',
    ],
    tags: ['Astro', 'Accessibility', 'Security', 'Motion'],
    glyph: 'layout',
    href: {
      label: 'View the source',
      path: 'https://github.com/TheApolloNTWK/ApolloNetwork',
      external: true,
    },
  },
  {
    id: 'apollo',
    title: 'APOLLO Network Application',
    kind: 'Personal intelligence environment',
    status: 'private',
    summary:
      'A working AI environment in private development: a primary interface coordinating specialist agents, multiple models, tools and memory, under a permission architecture its owner controls.',
    details: [
      'Voice and text interaction with one primary interface',
      'Specialist agents, model switching and fallback',
      'Permission and authority architecture',
    ],
    tags: ['Orchestration', 'Agents', 'Voice', 'Memory'],
    glyph: 'core',
    href: { label: 'About the application', path: 'application/' },
  },
];
