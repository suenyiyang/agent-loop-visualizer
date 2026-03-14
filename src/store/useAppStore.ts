import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextSlice, type ContextSlice } from './slices/context-slice';
import { createSequenceSlice, type SequenceSlice } from './slices/sequence-slice';
import { createConnectorSlice, type ConnectorSlice } from './slices/connector-slice';
import { createThemeSlice, type ThemeSlice } from './slices/theme-slice';

export type AppStore = ContextSlice & SequenceSlice & ConnectorSlice & ThemeSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createContextSlice(...a),
      ...createSequenceSlice(...a),
      ...createConnectorSlice(...a),
      ...createThemeSlice(...a),
    }),
    {
      name: 'agent-loop-visualizer',
      version: 1,
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
          apiKey: '',
        },
      }),
    },
  ),
);
