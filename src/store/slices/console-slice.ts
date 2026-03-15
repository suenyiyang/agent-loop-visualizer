import type { StateCreator } from 'zustand';
import { generateId } from '../../utils/id-generator';

export interface ConsoleEntry {
  id: string;
  timestamp: number;
  type: 'llm_request' | 'llm_response' | 'tool_call' | 'tool_result';
  rawJson: string;
  linkedContextMessageId: string | null;
  linkedSequenceStepId: string | null;
}

export interface ConsoleSlice {
  consoleEntries: ConsoleEntry[];
  consoleVisible: boolean;
  selectedConsoleEntryId: string | null;

  addConsoleEntry: (entry: Omit<ConsoleEntry, 'id' | 'timestamp'>) => string;
  toggleConsole: () => void;
  selectConsoleEntry: (id: string | null) => void;
  clearConsole: () => void;
  updateConsoleEntry: (id: string, updates: Partial<ConsoleEntry>) => void;
  setConsoleEntries: (entries: ConsoleEntry[]) => void;
}

export const createConsoleSlice: StateCreator<ConsoleSlice, [], [], ConsoleSlice> = (set, get) => ({
  consoleEntries: [],
  consoleVisible: false,
  selectedConsoleEntryId: null,

  addConsoleEntry: (entry) => {
    const id = generateId();
    set({
      consoleEntries: [
        ...get().consoleEntries,
        { ...entry, id, timestamp: Date.now() },
      ],
    });
    return id;
  },

  toggleConsole: () => set({ consoleVisible: !get().consoleVisible }),

  selectConsoleEntry: (id) => set({ selectedConsoleEntryId: id }),

  clearConsole: () => set({ consoleEntries: [], selectedConsoleEntryId: null }),

  updateConsoleEntry: (id, updates) => {
    set({
      consoleEntries: get().consoleEntries.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      ),
    });
  },

  setConsoleEntries: (entries) => set({ consoleEntries: entries, selectedConsoleEntryId: null }),
});
