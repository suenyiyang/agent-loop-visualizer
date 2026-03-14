import type { StateCreator } from 'zustand';
import type { ToolDefinition } from '../../types/settings';
import { generateId } from '../../utils/id-generator';

export interface SettingsSlice {
  systemPromptTemplate: string;
  toolDefinitions: ToolDefinition[];

  setSystemPromptTemplate: (template: string) => void;
  addToolDefinition: () => void;
  updateToolDefinition: (id: string, updates: Partial<Omit<ToolDefinition, 'id'>>) => void;
  removeToolDefinition: (id: string) => void;
}

const DEFAULT_TEMPLATE = 'You are a helpful assistant.\n\nAvailable tools:\n{{tools}}';

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (
  set,
  get,
) => ({
  systemPromptTemplate: DEFAULT_TEMPLATE,
  toolDefinitions: [],

  setSystemPromptTemplate: (template) => {
    set({ systemPromptTemplate: template });
  },

  addToolDefinition: () => {
    set({
      toolDefinitions: [
        ...get().toolDefinitions,
        { id: generateId(), name: '', description: '' },
      ],
    });
  },

  updateToolDefinition: (id, updates) => {
    set({
      toolDefinitions: get().toolDefinitions.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    });
  },

  removeToolDefinition: (id) => {
    set({
      toolDefinitions: get().toolDefinitions.filter((t) => t.id !== id),
    });
  },
});
