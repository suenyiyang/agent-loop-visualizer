export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parametersJson: string;
  defaultResult?: string;
  zodCode?: string;
  requiresApproval?: boolean;
  interruptConfig?: {
    enabled: boolean;
    type: 'approval' | 'user_input';
  };
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  template: string;
}
