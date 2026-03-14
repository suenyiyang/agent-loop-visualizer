import type { StateCreator } from 'zustand';
import type { AgentStatus } from '../../types/connector';

export interface PendingToolInput {
  toolCallId: string;
  toolName: string;
  toolArguments: string;
  defaultResult: string;
  resolve: (result: string) => void;
}

export interface PendingApproval {
  toolCallId: string;
  toolName: string;
  toolArguments: string;
  resolve: (approved: boolean) => void;
}

export interface PendingInterrupt {
  toolCallId: string;
  toolName: string;
  type: 'approval' | 'user_input';
  resolve: (input: string) => void;
}

export interface AgentExecutionSlice {
  pendingToolInput: PendingToolInput | null;
  setPendingToolInput: (input: PendingToolInput | null) => void;
  resolveToolInput: (result: string) => void;

  pendingApproval: PendingApproval | null;
  setPendingApproval: (approval: PendingApproval | null) => void;
  resolveApproval: (approved: boolean) => void;

  pendingInterrupt: PendingInterrupt | null;
  setPendingInterrupt: (interrupt: PendingInterrupt | null) => void;
  resolveInterrupt: (input: string) => void;
}

export const createAgentExecutionSlice: StateCreator<
  AgentExecutionSlice & { agentStatus: AgentStatus; setAgentStatus: (s: AgentStatus, e?: string) => void },
  [],
  [],
  AgentExecutionSlice
> = (set, get) => ({
  pendingToolInput: null,
  setPendingToolInput: (input) => {
    set({ pendingToolInput: input });
    if (input) {
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('paused');
    }
  },
  resolveToolInput: (result) => {
    const pending = get().pendingToolInput;
    if (pending) {
      pending.resolve(result);
      set({ pendingToolInput: null });
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('running');
    }
  },

  pendingApproval: null,
  setPendingApproval: (approval) => {
    set({ pendingApproval: approval });
    if (approval) {
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('paused');
    }
  },
  resolveApproval: (approved) => {
    const pending = get().pendingApproval;
    if (pending) {
      pending.resolve(approved);
      set({ pendingApproval: null });
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('running');
    }
  },

  pendingInterrupt: null,
  setPendingInterrupt: (interrupt) => {
    set({ pendingInterrupt: interrupt });
    if (interrupt) {
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('paused');
    }
  },
  resolveInterrupt: (input) => {
    const pending = get().pendingInterrupt;
    if (pending) {
      pending.resolve(input);
      set({ pendingInterrupt: null });
      (get() as unknown as { setAgentStatus: (s: AgentStatus, e?: string) => void }).setAgentStatus('running');
    }
  },
});
