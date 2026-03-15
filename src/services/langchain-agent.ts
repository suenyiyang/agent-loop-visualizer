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

function createAbortPromise(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    signal.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

export async function runAgent(userInput: string | null, signal: AbortSignal) {
  const state = useAppStore.getState();
  const { baseUrl, apiKey, modelId } = state.connectorSettings;
  const { systemPromptTemplates, toolDefinitions } = state;
  const templateText = systemPromptTemplates[0]?.template ?? '';

  const systemPrompt = resolveTemplate(templateText, {
    tools: formatToolsForPrompt(toolDefinitions),
  });

  const toolSchemas = buildToolSchemas(toolDefinitions);

  // When userInput is not null, visualize user message and add it
  if (userInput !== null) {
    handleVisualizationEvent({
      type: 'llm_start',
      content: userInput,
    });
  }

  // Build conversation from existing context messages
  // Re-read state after visualization event may have added message
  const currentState = useAppStore.getState();
  const existingMessages = currentState.messages;
  const messages: ChatMessage[] = [];

  let hasSystemPrompt = false;
  for (const msg of existingMessages) {
    if (msg.type === 'system_prompt') hasSystemPrompt = true;
    const chatMsg = contextToChat(msg);
    if (chatMsg) messages.push(chatMsg);
  }
  if (!hasSystemPrompt) {
    messages.unshift({ role: 'system', content: systemPrompt });
  }

  // If userInput was provided and state was captured before the event,
  // add the new user message explicitly (it wasn't in existingMessages yet
  // if state was captured before handleVisualizationEvent)
  if (userInput !== null && !existingMessages.some(
    (m) => m.type === 'user_message' && m.content === userInput && m === existingMessages[existingMessages.length - 1]
  )) {
    messages.push({ role: 'user', content: userInput });
  }

  const abortPromise = createAbortPromise(signal);
  const store = useAppStore.getState();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const body: Record<string, unknown> = {
      model: modelId,
      messages,
    };
    if (toolSchemas.length > 0) {
      body.tools = toolSchemas;
    }

    // Record console entry for request
    store.addConsoleEntry({
      type: 'llm_request',
      rawJson: JSON.stringify(body, null, 2),
      linkedContextMessageId: null,
      linkedSequenceStepId: null,
    });

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

    // Record console entry for response (linked to the assistant message that will be created)
    const responseEntryId = useAppStore.getState().addConsoleEntry({
      type: 'llm_response',
      rawJson: JSON.stringify(data, null, 2),
      linkedContextMessageId: null,
      linkedSequenceStepId: null,
    });

    const choice = data.choices?.[0];

    if (!choice) {
      throw new Error('No response from API');
    }

    const message = choice.message;

    // If no tool calls, this is the final response
    if (!message.tool_calls?.length) {
      if (message.content) {
        const viz = handleVisualizationEvent({
          type: 'agent_end',
          content: message.content,
        });
        // Back-link the response console entry to the assistant message
        useAppStore.getState().updateConsoleEntry(responseEntryId, {
          linkedContextMessageId: viz.messageId,
          linkedSequenceStepId: viz.stepId,
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
      const toolCallViz = handleVisualizationEvent({
        type: 'tool_start',
        content: typeof tc.function.arguments === 'string'
          ? tc.function.arguments
          : JSON.stringify(tc.function.arguments),
        toolName: tc.function.name,
        toolCallId: tc.id,
      });

      // Record console entry for tool call — linked to the tool_call context message
      useAppStore.getState().addConsoleEntry({
        type: 'tool_call',
        rawJson: JSON.stringify(tc, null, 2),
        linkedContextMessageId: toolCallViz.messageId,
        linkedSequenceStepId: toolCallViz.stepId,
      });

      // Look up tool definition
      const currentToolDefs = useAppStore.getState().toolDefinitions;
      const toolDef = currentToolDefs.find((t) => t.name === tc.function.name);

      // --- Feature 4: Tool Approval ---
      if (toolDef?.requiresApproval) {
        handleVisualizationEvent({
          type: 'approval_request',
          content: `Approval required for ${tc.function.name}`,
          toolName: tc.function.name,
        });

        const approved = await Promise.race([
          new Promise<boolean>((resolve) => {
            useAppStore.getState().setPendingApproval({
              toolCallId: tc.id,
              toolName: tc.function.name,
              toolArguments: typeof tc.function.arguments === 'string'
                ? tc.function.arguments
                : JSON.stringify(tc.function.arguments),
              resolve,
            });
          }),
          abortPromise,
        ]);

        if (!approved) {
          handleVisualizationEvent({
            type: 'approval_rejected',
            content: `Tool ${tc.function.name} was rejected by user`,
            toolName: tc.function.name,
          });

          const rejectionResult = JSON.stringify({ error: `Tool ${tc.function.name} was rejected by user` });
          handleVisualizationEvent({
            type: 'tool_end',
            content: rejectionResult,
            toolName: tc.function.name,
            toolCallId: tc.id,
          });
          messages.push({
            role: 'tool',
            content: rejectionResult,
            tool_call_id: tc.id,
          });
          continue;
        }

        handleVisualizationEvent({
          type: 'approval_granted',
          content: `Tool ${tc.function.name} approved`,
          toolName: tc.function.name,
        });
      }

      // --- Feature 2: User-provided tool result ---
      const defaultResult = toolDef?.defaultResult ?? JSON.stringify({
        result: `Mock result for ${tc.function.name}`,
        args: typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments || '{}')
          : tc.function.arguments,
      });

      const toolResult = await Promise.race([
        new Promise<string>((resolve) => {
          useAppStore.getState().setPendingToolInput({
            toolCallId: tc.id,
            toolName: tc.function.name,
            toolArguments: typeof tc.function.arguments === 'string'
              ? tc.function.arguments
              : JSON.stringify(tc.function.arguments),
            defaultResult,
            resolve,
          });
        }),
        abortPromise,
      ]);

      // --- Feature 4: Interrupt after tool result ---
      let finalResult = toolResult;
      if (toolDef?.interruptConfig?.enabled) {
        handleVisualizationEvent({
          type: 'interrupt_start',
          content: `Interrupt: ${toolDef.interruptConfig.type} for ${tc.function.name}`,
          toolName: tc.function.name,
        });

        const interruptInput = await Promise.race([
          new Promise<string>((resolve) => {
            useAppStore.getState().setPendingInterrupt({
              toolCallId: tc.id,
              toolName: tc.function.name,
              type: toolDef.interruptConfig!.type,
              resolve,
            });
          }),
          abortPromise,
        ]);

        if (toolDef.interruptConfig.type === 'user_input' && interruptInput.trim()) {
          // Append user input to tool result
          try {
            const parsed = JSON.parse(finalResult);
            parsed._userAnnotation = interruptInput;
            finalResult = JSON.stringify(parsed);
          } catch {
            finalResult = finalResult + '\n\nUser annotation: ' + interruptInput;
          }
        }

        handleVisualizationEvent({
          type: 'interrupt_end',
          content: `Interrupt resolved for ${tc.function.name}`,
          toolName: tc.function.name,
        });
      }

      // Visualize tool result
      const toolResultViz = handleVisualizationEvent({
        type: 'tool_end',
        content: finalResult,
        toolName: tc.function.name,
        toolCallId: tc.id,
      });

      // Record console entry for tool result — linked to the tool_result context message
      useAppStore.getState().addConsoleEntry({
        type: 'tool_result',
        rawJson: finalResult,
        linkedContextMessageId: toolResultViz.messageId,
        linkedSequenceStepId: toolResultViz.stepId,
      });

      // Add tool result to conversation for next round
      messages.push({
        role: 'tool',
        content: finalResult,
        tool_call_id: tc.id,
      });
    }

    // Loop continues - will send tool results back to LLM
  }
}
