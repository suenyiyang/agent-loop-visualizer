import type { StateCreator } from 'zustand';
import type { ConnectorSettings, AgentStatus } from '../../types/connector';

export interface ConnectorSlice {
  connectorSettings: ConnectorSettings;
  agentStatus: AgentStatus;
  agentError: string | null;

  setConnectorSettings: (settings: Partial<ConnectorSettings>) => void;
  setAgentStatus: (status: AgentStatus, error?: string) => void;
  resetConnectorSettings: () => void;
}

const DEFAULT_CONNECTOR_SETTINGS: ConnectorSettings = {
  baseUrl: 'http://localhost:11434/v1',
  apiKey: 'ollama',
  modelId: 'qwen3.5:0.8b',
};

export const createConnectorSlice: StateCreator<ConnectorSlice, [], [], ConnectorSlice> = (
  set,
  get,
) => ({
  connectorSettings: { ...DEFAULT_CONNECTOR_SETTINGS },
  agentStatus: 'idle',
  agentError: null,

  setConnectorSettings: (settings) => {
    set({
      connectorSettings: { ...get().connectorSettings, ...settings },
    });
  },

  setAgentStatus: (status, error) => {
    set({ agentStatus: status, agentError: error ?? null });
  },

  resetConnectorSettings: () =>
    set({ connectorSettings: { ...DEFAULT_CONNECTOR_SETTINGS }, agentStatus: 'idle', agentError: null }),
});
