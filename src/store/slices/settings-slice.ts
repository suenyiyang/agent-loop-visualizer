import type { StateCreator } from 'zustand';
import type { ToolDefinition, SystemPromptTemplate } from '../../types/settings';
import { generateId } from '../../utils/id-generator';

export interface SettingsSlice {
  systemPromptTemplates: SystemPromptTemplate[];
  toolDefinitions: ToolDefinition[];

  addSystemPromptTemplate: (name?: string, template?: string) => string;
  updateSystemPromptTemplate: (id: string, updates: Partial<Omit<SystemPromptTemplate, 'id'>>) => void;
  removeSystemPromptTemplate: (id: string) => void;
  setSystemPromptTemplates: (templates: SystemPromptTemplate[]) => void;

  addToolDefinition: () => void;
  updateToolDefinition: (id: string, updates: Partial<Omit<ToolDefinition, 'id'>>) => void;
  removeToolDefinition: (id: string) => void;
  resetSettings: () => void;
}

export const DEFAULT_TEMPLATE_TEXT = 'You are a helpful assistant.\n\nAvailable tools:\n{{tools}}';

export const DEFAULT_TEMPLATES: SystemPromptTemplate[] = [
  { id: 'default', name: 'Default', template: DEFAULT_TEMPLATE_TEXT },
];

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (
  set,
  get,
) => ({
  systemPromptTemplates: DEFAULT_TEMPLATES,
  toolDefinitions: [],

  addSystemPromptTemplate: (name, template) => {
    const id = generateId();
    set({
      systemPromptTemplates: [
        ...get().systemPromptTemplates,
        { id, name: name ?? 'New Template', template: template ?? '' },
      ],
    });
    return id;
  },

  updateSystemPromptTemplate: (id, updates) => {
    set({
      systemPromptTemplates: get().systemPromptTemplates.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    });
  },

  removeSystemPromptTemplate: (id) => {
    set({ systemPromptTemplates: get().systemPromptTemplates.filter((t) => t.id !== id) });
  },

  setSystemPromptTemplates: (templates) => set({ systemPromptTemplates: templates }),

  addToolDefinition: () => {
    set({
      toolDefinitions: [
        ...get().toolDefinitions,
        { id: generateId(), name: '', description: '', parametersJson: '' },
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

  resetSettings: () =>
    set({
      systemPromptTemplates: DEFAULT_TEMPLATES,
      toolDefinitions: [],
    }),
});
