export type ActorId = 'frontend' | 'backend' | 'llm' | 'tool';

export type StepType = 'message' | 'self_message' | 'interrupt' | 'resume';

export interface Actor {
  id: ActorId;
  label: string;
  color: string;
}

export interface SequenceStep {
  id: string;
  type: StepType;
  from: ActorId;
  to: ActorId;
  label: string;
  isAsync: boolean;
  linkedContextMessageId: string | null;
  interruptType?: 'approval' | 'user_input';
  wrapModelCall?: boolean;
  wrapToolCall?: boolean;
  order: number;
}

export interface ActorGroup {
  id: string;
  label: string;
  actorIds: ActorId[];
  color: string;
}
