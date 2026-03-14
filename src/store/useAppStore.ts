import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextSlice, type ContextSlice } from './slices/context-slice';
import { createSequenceSlice, type SequenceSlice } from './slices/sequence-slice';
import { createConnectorSlice, type ConnectorSlice } from './slices/connector-slice';
import { createThemeSlice, type ThemeSlice } from './slices/theme-slice';
import { createSettingsSlice, type SettingsSlice } from './slices/settings-slice';
import { createAgentExecutionSlice, type AgentExecutionSlice } from './slices/agent-execution-slice';
import { createConsoleSlice, type ConsoleSlice } from './slices/console-slice';
import { createFocusSlice, type FocusSlice } from './slices/focus-slice';

export type AppStore = ContextSlice & SequenceSlice & ConnectorSlice & ThemeSlice & SettingsSlice & AgentExecutionSlice & ConsoleSlice & FocusSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createContextSlice(...a),
      ...createSequenceSlice(...a),
      ...createConnectorSlice(...a),
      ...createThemeSlice(...a),
      ...createSettingsSlice(...a),
      ...createAgentExecutionSlice(...a),
      ...createConsoleSlice(...a),
      ...createFocusSlice(...a),
    }),
    {
      name: 'agent-loop-visualizer',
      version: 2,
      partialize: (state) => ({
        messages: state.messages,
        tokenLimit: state.tokenLimit,
        steps: state.steps,
        actors: state.actors,
        groups: state.groups,
        themeMode: state.themeMode,
        connectorSettings: {
          baseUrl: state.connectorSettings.baseUrl,
          modelId: state.connectorSettings.modelId,
          apiKey: state.connectorSettings.apiKey,
        },
        systemPromptTemplates: state.systemPromptTemplates,
        toolDefinitions: state.toolDefinitions,
        consoleVisible: state.consoleVisible,
      }),
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // Migrate single systemPromptTemplate → systemPromptTemplates array
          const oldTemplate = state.systemPromptTemplate as string | undefined;
          if (oldTemplate && !state.systemPromptTemplates) {
            state.systemPromptTemplates = [
              { id: 'default', name: 'Default', template: oldTemplate },
            ];
          }
          delete state.systemPromptTemplate;
          delete state.activeTemplateId;
        }
        return state;
      },
    },
  ),
);
