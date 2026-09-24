import type { IconName } from '../components/Icon.astro';

/** The three verbs that frame what the environment is for. */
export const triad = [
  {
    verb: 'Understand',
    summary: 'Think with it.',
    body: 'Ask questions, work through problems and draw on context you have chosen to keep — with the reasoning visible, not hidden behind a single answer.',
  },
  {
    verb: 'Build',
    summary: 'Shape it.',
    body: 'Choose the models, specialist agents, tools and interface that suit how you work. The environment is assembled around you, not the other way round.',
  },
  {
    verb: 'Execute',
    summary: 'Let it act.',
    body: 'Carry work forward: run workflows, operate tools and follow tasks through — inside permissions you set, can inspect and can revoke.',
  },
] as const;

export interface EnvironmentModule {
  id: string;
  name: string;
  icon: IconName;
  summary: string;
}

/**
 * The parts a person could configure. These describe the concept and the
 * direction of the product — they are not a list of released features.
 */
export const modules: EnvironmentModule[] = [
  {
    id: 'models',
    name: 'Models',
    icon: 'models',
    summary:
      'Pick the models behind each task, from different providers, running locally or in the cloud.',
  },
  {
    id: 'agents',
    name: 'Agents',
    icon: 'agents',
    summary:
      'Specialists with a defined job — research, code, planning — coordinated by a primary interface.',
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: 'tools',
    summary: 'The actions the environment is allowed to take, and the services it can reach.',
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: 'memory',
    summary:
      'Context that persists because you decided it should — reviewable, editable and removable.',
  },
  {
    id: 'voice',
    name: 'Voice',
    icon: 'voice',
    summary: 'Speak to it and hear it answer, when talking is the better interface.',
  },
  {
    id: 'permissions',
    name: 'Permissions',
    icon: 'permissions',
    summary:
      'Clear boundaries on what can be read, changed or run — and what needs your approval first.',
  },
  {
    id: 'devices',
    name: 'Devices',
    icon: 'devices',
    summary: 'The same environment across the machines you use, rather than one app per screen.',
  },
  {
    id: 'interface',
    name: 'Interface',
    icon: 'interface',
    summary: 'A workspace you can arrange — conversation, visual canvas, or both.',
  },
];

/** Product principles. These are commitments about direction, not features. */
export const principles = [
  {
    title: 'Control',
    body: 'Your environment runs on your terms. You choose what it uses, what it remembers and what it may do.',
  },
  {
    title: 'Transparency',
    body: 'You should be able to see which model answered, which agent acted and why. No black boxes by default.',
  },
  {
    title: 'Adaptability',
    body: 'Providers change, models improve, needs shift. Nothing should lock you into one vendor or one way of working.',
  },
  {
    title: 'Understandable authority',
    body: 'When the environment acts on your behalf, the limits of that authority are plain enough to explain in a sentence.',
  },
] as const;

/**
 * What a future user could decide for themselves. Every item here is product
 * direction — none of it is presented as publicly available.
 */
export const configurable = [
  { name: 'Models', decide: 'Which models handle which kinds of work, and from which providers.' },
  {
    name: 'Agents',
    decide: 'Which specialists exist, what each is for, and how they collaborate.',
  },
  { name: 'Tools', decide: 'Which actions are available, and which are off the table entirely.' },
  { name: 'Memory', decide: 'What is remembered, for how long, and what is forgotten on request.' },
  { name: 'Voice', decide: 'Whether you talk to it, and how it sounds when it answers.' },
  {
    name: 'Permissions',
    decide: 'What can be done freely, what needs approval, and what never happens.',
  },
  { name: 'Integrations', decide: 'Which of your services and data sources it may connect to.' },
  { name: 'Devices', decide: 'Where your environment is available, and what each device can do.' },
  { name: 'Interface', decide: 'How it looks and is arranged — conversational, visual, or both.' },
  { name: 'Execution', decide: 'Whether work runs on your own hardware, in the cloud, or a mix.' },
] as const;

/** Clarifying what the concept is not, to prevent over-reading it. */
export const notThis = [
  {
    title: 'Not a wrapper around one provider',
    body: 'Models will keep changing. An environment tied to one company inherits that company’s limits and decisions. APOLLO Network is designed to outlive any single model.',
  },
  {
    title: 'Not a copy of someone else’s assistant',
    body: 'APOLLO Network began as one person’s private system. The public product is meant to be yours — assembled from your choices, not cloned from theirs.',
  },
  {
    title: 'Not an autonomous black box',
    body: 'Capability without visibility is a liability. The environment is meant to show its work and stay inside boundaries you can read.',
  },
  {
    title: 'Not something you can download yet',
    body: 'The private system is real and in active development; the public product is not released. This site will say plainly when that changes.',
  },
] as const;
