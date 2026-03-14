import { useAppStore } from '../store/useAppStore';
import { handleVisualizationEvent } from './visualization-callback';
import { resolveTemplate } from '../utils/template';
import { buildToolSchemas, formatToolsForPrompt } from '../utils/tool-schema';
import type { ContextMessage } from '../types/context';

const MAX_TOOL_ROUNDS = 5;

interface ChatMessage {
  role: string;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

function contextToChat(msg: ContextMessage): ChatMessage | null {
  switch (msg.type) {
    case 'system_prompt':
      return { role: 'system', content: msg.content };
    case 'user_message':
      return { role: 'user', content: msg.content };
    case 'assistant_response':
      return { role: 'assistant', content: msg.content };
    case 'tool_call':
      return {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: msg.metadata?.toolCallId ?? `call_${msg.id}`,
          type: 'function',
          function: {
            name: msg.metadata?.toolName ?? 'unknown',
            arguments: msg.content,
          },
        }],
      };
    case 'tool_result':
      return {
        role: 'tool',
        content: msg.content,
        tool_call_id: msg.metadata?.toolCallId ?? `call_${msg.id}`,
      };
    default:
      return null;
  }
}

export async function runAgent(userInput: string, signal: AbortSignal) {
  const state = useAppStore.getState();
  const { baseUrl, apiKey, modelId } = state.connectorSettings;
  const { systemPromptTemplates, toolDefinitions } = state;
  const templateText = systemPromptTemplates[0]?.template ?? '';

  const systemPrompt = resolveTemplate(templateText, {
    tools: formatToolsForPrompt(toolDefinitions),
  });

  const toolSchemas = buildToolSchemas(toolDefinitions);

  // Visualize user message
  handleVisualizationEvent({
    type: 'llm_start',
    content: userInput,
  });

  // Build conversation from existing context messages
  const existingMessages = state.messages;
  const messages: ChatMessage[] = [];

  if (existingMessages.length > 0) {
    // Use existing messages as conversation history
    // Check if there's already a system prompt in the context
    let hasSystemPrompt = false;
    for (const msg of existingMessages) {
      if (msg.type === 'system_prompt') hasSystemPrompt = true;
      const chatMsg = contextToChat(msg);
      if (chatMsg) messages.push(chatMsg);
    }
    if (!hasSystemPrompt) {
      messages.unshift({ role: 'system', content: systemPrompt });
    }
    // The new user input was already added to context via handleVisualizationEvent above,
    // so it will be in the messages array from the loop. But since state was captured before
    // the event, we need to add the new user message explicitly.
    messages.push({ role: 'user', content: userInput });
  } else {
    messages.push(
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    );
  }

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const body: Record<string, unknown> = {
      model: modelId,
      messages,
    };
    if (toolSchemas.length > 0) {
      body.tools = toolSchemas;
    }

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
      const text = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${response.statusText}\n${text}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice) {
      throw new Error('No response from API');
    }

    const message = choice.message;

    // If no tool calls, this is the final response
    if (!message.tool_calls?.length) {
      if (message.content) {
        handleVisualizationEvent({
          type: 'agent_end',
          content: message.content,
        });
      }
      return;
    }

    // Handle tool calls
    // Add assistant message with tool calls to conversation
    messages.push({
      role: 'assistant',
      content: message.content ?? null,
      tool_calls: message.tool_calls,
    });

    for (const tc of message.tool_calls as ToolCall[]) {
      // Visualize tool call
      handleVisualizationEvent({
        type: 'tool_start',
        content: typeof tc.function.arguments === 'string'
          ? tc.function.arguments
          : JSON.stringify(tc.function.arguments),
        toolName: tc.function.name,
      });

      // Generate mock tool result
      const mockResult = JSON.stringify({
        result: `Mock result for ${tc.function.name}`,
        args: typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments || '{}')
          : tc.function.arguments,
      });

      // Visualize tool result
      handleVisualizationEvent({
        type: 'tool_end',
        content: mockResult,
      });

      // Add tool result to conversation for next round
      messages.push({
        role: 'tool',
        content: mockResult,
        tool_call_id: tc.id,
      });
    }

    // Loop continues - will send tool results back to LLM
  }
}
