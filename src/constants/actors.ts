import type { Actor, ActorGroup } from '../types/sequence';

export const DEFAULT_ACTORS: Actor[] = [
  { id: 'frontend', label: 'Frontend', color: '#3b82f6' },
  { id: 'backend', label: 'Backend', color: '#8b5cf6' },
  { id: 'llm', label: 'LLM', color: '#10b981' },
  { id: 'tool', label: 'Tool', color: '#f59e0b' },
];

export const DEFAULT_GROUPS: ActorGroup[] = [
  {
    id: 'agent-service',
    label: 'Agent Service',
    actorIds: ['llm', 'tool'],
    color: '#475569',
  },
];
