import type { ToolDefinition } from '../types/settings';

export function buildToolSchemas(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: { type: 'object', properties: {} },
    },
  }));
}

export function formatToolsForPrompt(tools: ToolDefinition[]): string {
  if (tools.length === 0) return '(none)';
  return tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');
}
