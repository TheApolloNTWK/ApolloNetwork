import type { Status } from './status';

/**
 * Public, high-level description of the private APOLLO Network system.
 *
 * The system is real and in active development. This file describes WHAT it
 * does at the level of concepts — never HOW: no endpoints, prompts, file
 * paths, infrastructure, memory contents, model/provider specifics or
 * security implementation detail. Review any change with that in mind.
 *
 * Items without a status exist in the private system today. They are not
 * presented as finished or production-ready.
 */

export interface ProjectItem {
  name: string;
  body: string;
  status?: Extract<Status, 'developing' | 'experimental' | 'exploring'>;
}

export interface ProjectLayer {
  id: string;
  name: string;
  role: string;
  items: ProjectItem[];
}

export const layers: ProjectLayer[] = [
  {
    id: 'interface',
    name: 'Interface',
    role: 'How you reach it',
    items: [
      {
        name: 'Primary APOLLO interface',
        body: 'One point of contact. You talk to APOLLO; APOLLO coordinates everything behind it.',
      },
      {
        name: 'Voice interaction',
        body: 'Spoken conversation with the primary interface, alongside text.',
      },
      {
        name: 'Visual workspace',
        body: 'A spatial view of the environment — tasks, agents and results — next to the conversation.',
      },
      {
        name: 'Native APOLLO Network interface',
        body: 'A dedicated application interface for the environment.',
        status: 'developing',
      },
    ],
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    role: 'How work is directed',
    items: [
      {
        name: 'Orchestrator',
        body: 'Understands a request, plans the work and decides which agent, model or tool should handle each part.',
      },
      {
        name: 'Tools and workflows',
        body: 'Defined actions and multi-step workflows the system can run, each with a known scope.',
      },
      {
        name: 'Computer and application integrations',
        body: 'Working with applications on the machine it runs on, within the permissions it has been given.',
      },
    ],
  },
  {
    id: 'capability',
    name: 'Capability',
    role: 'What does the work',
    items: [
      {
        name: 'Specialist agents',
        body: 'Focused agents for distinct kinds of work, called on by the orchestrator.',
      },
      {
        name: 'Multiple model back-ends',
        body: 'Different models and providers for different jobs, rather than one model for everything.',
      },
      {
        name: 'Model switching and fallback',
        body: 'When a model is unsuitable or unavailable, work can move to another.',
      },
      {
        name: 'Local & cloud intelligence',
        body: 'Operates today across both cloud and local model back-ends, with ongoing development around model selection, fallback and resilient continuity.',
        status: 'developing',
      },
      {
        name: 'Memory architecture',
        body: 'Structured, persistent context the system can draw on — kept under the owner’s control.',
      },
    ],
  },
  {
    id: 'oversight',
    name: 'Oversight',
    role: 'What keeps it accountable',
    items: [
      {
        name: 'Permission and authority architecture',
        body: 'Clear levels of authority: what may happen freely, what needs approval, and what never happens.',
      },
      {
        name: 'Independent oversight',
        body: 'A separate oversight layer designed to monitor agent behaviour, authority boundaries and system integrity.',
        status: 'developing',
      },
    ],
  },
];

/** What the project is and is not, stated plainly. */
export const projectFacts = [
  { term: 'Status', detail: 'A working system in active private development' },
  { term: 'Availability', detail: 'Not publicly released or downloadable' },
  { term: 'Source', detail: 'Private — this website’s code is public, the system’s is not' },
  { term: 'Pricing', detail: 'None — there is nothing to buy yet' },
] as const;

/**
 * The distinction between the private system that exists and the public
 * product it will inform. Keep the right-hand column clearly future tense.
 */
export const privateVsPublic = {
  private: {
    title: 'The private system',
    status: 'private' as const,
    points: [
      'Exists today, and is built and used by its founder',
      'Where every idea on this site is tested against real work',
      'Evolves continuously; parts are still in development',
      'Not available to download, and not intended to be copied',
    ],
  },
  public: {
    title: 'The public product',
    status: 'future' as const,
    points: [
      'A configurable environment each person shapes for themselves',
      'Your choice of models, agents, tools, memory, voice and permissions',
      'Built from the lessons and technology of the private system',
      'Not yet released, and no release date is announced',
    ],
  },
} as const;
