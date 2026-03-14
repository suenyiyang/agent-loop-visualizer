import type { ToolDefinition } from '../types/settings';

export function buildToolSchemas(tools: ToolDefinition[]) {
  return tools.map((tool) => {
    let parameters: Record<string, unknown> = { type: 'object', properties: {} };
    if (tool.parametersJson?.trim()) {
      try {
        parameters = JSON.parse(tool.parametersJson);
      } catch {
        // fallback to empty params
      }
    }
    return {
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters,
      },
    };
  });
}

export function formatToolsForPrompt(tools: ToolDefinition[]): string {
  if (tools.length === 0) return '(none)';
  return tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');
}
