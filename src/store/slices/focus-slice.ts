import type { StateCreator } from 'zustand';
import type { ConsoleSlice } from './console-slice';
import type { ContextSlice } from './context-slice';

export interface FocusTarget {
  contextMessageId: string | null;
  sequenceStepId: string | null;
  consoleEntryId: string | null;
}

export interface FocusSlice {
  focusTarget: FocusTarget;
  setFocus: (target: Partial<FocusTarget>) => void;
  clearFocus: () => void;
}

const EMPTY_FOCUS: FocusTarget = {
  contextMessageId: null,
  sequenceStepId: null,
  consoleEntryId: null,
};

export const createFocusSlice: StateCreator<
  FocusSlice & ConsoleSlice & ContextSlice,
  [],
  [],
  FocusSlice
> = (set, get) => ({
  focusTarget: { ...EMPTY_FOCUS },

  setFocus: (target) => {
    const state = get();
    const resolved: FocusTarget = { ...EMPTY_FOCUS };

    // Start with whatever was explicitly provided
    if (target.contextMessageId !== undefined) resolved.contextMessageId = target.contextMessageId;
    if (target.sequenceStepId !== undefined) resolved.sequenceStepId = target.sequenceStepId;
    if (target.consoleEntryId !== undefined) resolved.consoleEntryId = target.consoleEntryId;

    // Resolve missing IDs from context message
    if (resolved.contextMessageId && !resolved.sequenceStepId) {
      const msg = state.messages.find((m) => m.id === resolved.contextMessageId);
      if (msg) resolved.sequenceStepId = msg.linkedSequenceStepId;
    }

    // Resolve missing console entry from context message
    if (resolved.contextMessageId && !resolved.consoleEntryId) {
      const entry = state.consoleEntries.find(
        (e) => e.linkedContextMessageId === resolved.contextMessageId,
      );
      if (entry) resolved.consoleEntryId = entry.id;
    }

    // Resolve missing context message from console entry
    if (resolved.consoleEntryId && !resolved.contextMessageId) {
      const entry = state.consoleEntries.find((e) => e.id === resolved.consoleEntryId);
      if (entry) {
        resolved.contextMessageId = entry.linkedContextMessageId;
        if (!resolved.sequenceStepId) resolved.sequenceStepId = entry.linkedSequenceStepId;
      }
    }

    // Resolve missing context message from sequence step
    if (resolved.sequenceStepId && !resolved.contextMessageId) {
      const msg = state.messages.find(
        (m) => m.linkedSequenceStepId === resolved.sequenceStepId,
      );
      if (msg) {
        resolved.contextMessageId = msg.id;
        // Also try to find console entry
        if (!resolved.consoleEntryId) {
          const entry = state.consoleEntries.find(
            (e) => e.linkedContextMessageId === msg.id,
          );
          if (entry) resolved.consoleEntryId = entry.id;
        }
      }
    }

    set({ focusTarget: resolved });
  },

  clearFocus: () => {
    set({ focusTarget: { ...EMPTY_FOCUS } });
  },
});
