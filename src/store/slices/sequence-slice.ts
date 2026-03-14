import type { StateCreator } from 'zustand';
import type { Actor, SequenceStep, ActorGroup, ActorId, StepType } from '../../types/sequence';
import { DEFAULT_ACTORS, DEFAULT_GROUPS } from '../../constants/actors';
import { generateId } from '../../utils/id-generator';

export interface SequenceSlice {
  actors: Actor[];
  steps: SequenceStep[];
  groups: ActorGroup[];
  selectedStepId: string | null;
  _seqSource: 'user' | 'sync' | 'agent';

  addStep: (
    from: ActorId,
    to: ActorId,
    label: string,
    options?: Partial<Pick<SequenceStep, 'type' | 'isAsync' | 'wrapModelCall' | 'wrapToolCall' | 'interruptType'>>,
    source?: 'user' | 'sync' | 'agent',
  ) => string;
  updateStep: (id: string, updates: Partial<SequenceStep>) => void;
  removeStep: (id: string, source?: 'user' | 'sync' | 'agent') => void;
  reorderSteps: (activeId: string, overId: string) => void;
  selectStep: (id: string | null) => void;
  linkStepToMessage: (stepId: string, messageId: string) => void;
  setSteps: (steps: SequenceStep[]) => void;
  setActors: (actors: Actor[]) => void;
  setGroups: (groups: ActorGroup[]) => void;
}

export const createSequenceSlice: StateCreator<SequenceSlice, [], [], SequenceSlice> = (
  set,
  get,
) => ({
  actors: DEFAULT_ACTORS,
  steps: [],
  groups: DEFAULT_GROUPS,
  selectedStepId: null,
  _seqSource: 'user',

  addStep: (from, to, label, options = {}, source = 'user') => {
    const id = generateId();
    const steps = get().steps;
    const order = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 0;
    const step: SequenceStep = {
      id,
      type: (options.type as StepType) ?? 'message',
      from,
      to,
      label,
      isAsync: options.isAsync ?? false,
      linkedContextMessageId: null,
      wrapModelCall: options.wrapModelCall,
      wrapToolCall: options.wrapToolCall,
      interruptType: options.interruptType,
      order,
    };
    set({ steps: [...steps, step], _seqSource: source });
    return id;
  },

  updateStep: (id, updates) => {
    set({
      steps: get().steps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      _seqSource: 'user',
    });
  },

  removeStep: (id, source = 'user') => {
    set({ steps: get().steps.filter((s) => s.id !== id), _seqSource: source });
  },

  reorderSteps: (activeId, overId) => {
    const steps = [...get().steps].sort((a, b) => a.order - b.order);
    const oldIdx = steps.findIndex((s) => s.id === activeId);
    const newIdx = steps.findIndex((s) => s.id === overId);
    if (oldIdx === -1 || newIdx === -1) return;
    const [moved] = steps.splice(oldIdx, 1);
    steps.splice(newIdx, 0, moved);
    const reordered = steps.map((s, i) => ({ ...s, order: i }));
    set({ steps: reordered, _seqSource: 'user' });
  },

  selectStep: (id) => set({ selectedStepId: id }),

  linkStepToMessage: (stepId, messageId) => {
    set({
      steps: get().steps.map((s) =>
        s.id === stepId ? { ...s, linkedContextMessageId: messageId } : s,
      ),
    });
  },

  setSteps: (steps) => set({ steps, _seqSource: 'sync' }),
  setActors: (actors) => set({ actors }),
  setGroups: (groups) => set({ groups }),
});
