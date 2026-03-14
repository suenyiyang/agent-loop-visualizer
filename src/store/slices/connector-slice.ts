import type { StateCreator } from 'zustand';
import type { ConnectorSettings, AgentStatus } from '../../types/connector';

export interface ConnectorSlice {
  connectorSettings: ConnectorSettings;
  agentStatus: AgentStatus;
  agentError: string | null;

  setConnectorSettings: (settings: Partial<ConnectorSettings>) => void;
  setAgentStatus: (status: AgentStatus, error?: string) => void;
}

export const createConnectorSlice: StateCreator<ConnectorSlice, [], [], ConnectorSlice> = (
  set,
  get,
) => ({
  connectorSettings: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelId: 'gpt-4o',
  },
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
});
