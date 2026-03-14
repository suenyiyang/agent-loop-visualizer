export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parametersJson: string;
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  template: string;
}
