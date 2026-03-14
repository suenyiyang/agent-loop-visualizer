export type MessageType =
  | 'system_prompt'
  | 'user_message'
  | 'assistant_response'
  | 'tool_call'
  | 'tool_result';

export interface ContextMessage {
  id: string;
  type: MessageType;
  content: string;
  tokenCount: number;
  tokenCountManual: boolean;
  metadata?: { toolName?: string; toolCallId?: string };
  linkedSequenceStepId: string | null;
}
