import { useAppStore } from '../store/useAppStore';
import { handleVisualizationEvent } from './visualization-callback';
import { resolveTemplate } from '../utils/template';
import { buildToolSchemas, formatToolsForPrompt } from '../utils/tool-schema';

export async function runAgent(userInput: string, signal: AbortSignal) {
  const state = useAppStore.getState();
  const { baseUrl, apiKey, modelId } = state.connectorSettings;
  const { systemPromptTemplate, toolDefinitions } = state;

  const systemPrompt = resolveTemplate(systemPromptTemplate, {
    tools: formatToolsForPrompt(toolDefinitions),
  });

  const toolSchemas = buildToolSchemas(toolDefinitions);

  // Add system prompt
  handleVisualizationEvent({
    type: 'llm_start',
    content: userInput,
  });

  // Build request body
  const body: Record<string, unknown> = {
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ],
  };
  if (toolSchemas.length > 0) {
    body.tools = toolSchemas;
  }

  // Make a direct API call to an OpenAI-compatible endpoint
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  if (!choice) {
    throw new Error('No response from API');
  }

  const message = choice.message;

  // Handle tool calls
  if (message.tool_calls?.length) {
    for (const tc of message.tool_calls) {
      handleVisualizationEvent({
        type: 'tool_start',
        content: JSON.stringify(tc.function.arguments),
        toolName: tc.function.name,
      });

      // Simulate tool result
      const toolResult = JSON.stringify({
        result: `Mock result for ${tc.function.name}`,
      });
      handleVisualizationEvent({
        type: 'tool_end',
        content: toolResult,
      });
    }
  }

  // Final response
  if (message.content) {
    handleVisualizationEvent({
      type: 'agent_end',
      content: message.content,
    });
  }
}
