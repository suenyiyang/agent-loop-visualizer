export interface ConnectorSettings {
  baseUrl: string;
  apiKey: string;
  modelId: string;
}

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error';
