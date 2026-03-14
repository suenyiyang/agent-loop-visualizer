import type { MessageType } from '../types/context';

export const MESSAGE_TYPE_CONFIG: Record<
  MessageType,
  { label: string; color: string; shortLabel: string }
> = {
  system_prompt: { label: 'System Prompt', color: '#8b5cf6', shortLabel: 'SYS' },
  user_message: { label: 'User Message', color: '#3b82f6', shortLabel: 'USR' },
  assistant_response: { label: 'Assistant Response', color: '#10b981', shortLabel: 'AST' },
  tool_call: { label: 'Tool Call', color: '#f59e0b', shortLabel: 'T→' },
  tool_result: { label: 'Tool Result', color: '#ef4444', shortLabel: '←T' },
};

export const MESSAGE_TYPES: MessageType[] = [
  'system_prompt',
  'user_message',
  'assistant_response',
  'tool_call',
  'tool_result',
];
