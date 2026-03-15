import { useAppStore } from '../store/useAppStore';
import { syncOnMessageAdd } from '../store/slices/sync-middleware';

interface CallbackEvent {
  type: 'llm_start' | 'llm_end' | 'tool_start' | 'tool_end' | 'agent_end'
    | 'approval_request' | 'approval_granted' | 'approval_rejected'
    | 'interrupt_start' | 'interrupt_end';
  content: string;
  toolName?: string;
  toolCallId?: string;
}

interface VisualizationResult {
  messageId: string | null;
  stepId: string | null;
}

export function handleVisualizationEvent(event: CallbackEvent): VisualizationResult {
  const store = useAppStore.getState();

  switch (event.type) {
    case 'llm_start': {
      const messageId = store.addMessage('user_message', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), messageId);
      const msg = useAppStore.getState().messages.find((m) => m.id === messageId);
      return { messageId, stepId: msg?.linkedSequenceStepId ?? null };
    }
    case 'llm_end': {
      const messageId = store.addMessage('assistant_response', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), messageId);
      const msg = useAppStore.getState().messages.find((m) => m.id === messageId);
      return { messageId, stepId: msg?.linkedSequenceStepId ?? null };
    }
    case 'tool_start': {
      const messageId = store.addMessage('tool_call', event.content, 'agent');
      const meta: Record<string, string> = {};
      if (event.toolName) meta.toolName = event.toolName;
      if (event.toolCallId) meta.toolCallId = event.toolCallId;
      if (Object.keys(meta).length > 0) {
        store.updateMessage(messageId, { metadata: meta });
      }
      syncOnMessageAdd(useAppStore.getState(), messageId);
      const msg = useAppStore.getState().messages.find((m) => m.id === messageId);
      return { messageId, stepId: msg?.linkedSequenceStepId ?? null };
    }
    case 'tool_end': {
      const messageId = store.addMessage('tool_result', event.content, 'agent');
      const meta: Record<string, string> = {};
      if (event.toolName) meta.toolName = event.toolName;
      if (event.toolCallId) meta.toolCallId = event.toolCallId;
      if (Object.keys(meta).length > 0) {
        store.updateMessage(messageId, { metadata: meta });
      }
      syncOnMessageAdd(useAppStore.getState(), messageId);
      const msg = useAppStore.getState().messages.find((m) => m.id === messageId);
      return { messageId, stepId: msg?.linkedSequenceStepId ?? null };
    }
    case 'agent_end': {
      const messageId = store.addMessage('assistant_response', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), messageId);
      const msg = useAppStore.getState().messages.find((m) => m.id === messageId);
      return { messageId, stepId: msg?.linkedSequenceStepId ?? null };
    }
    // Approval and interrupt events create sequence steps for visualization
    case 'approval_request': {
      const stepId = store.addStep('backend', 'frontend', `Approval: ${event.toolName ?? 'tool'}`, {
        type: 'interrupt',
        interruptType: 'approval',
      }, 'agent');
      return { messageId: null, stepId };
    }
    case 'approval_granted': {
      const stepId = store.addStep('frontend', 'backend', `Approved: ${event.toolName ?? 'tool'}`, {
        type: 'resume',
      }, 'agent');
      return { messageId: null, stepId };
    }
    case 'approval_rejected': {
      const stepId = store.addStep('frontend', 'backend', `Rejected: ${event.toolName ?? 'tool'}`, {
        type: 'resume',
      }, 'agent');
      return { messageId: null, stepId };
    }
    case 'interrupt_start': {
      const stepId = store.addStep('backend', 'frontend', `Interrupt: ${event.toolName ?? 'tool'}`, {
        type: 'interrupt',
        interruptType: 'user_input',
      }, 'agent');
      return { messageId: null, stepId };
    }
    case 'interrupt_end': {
      const stepId = store.addStep('frontend', 'backend', `Resume: ${event.toolName ?? 'tool'}`, {
        type: 'resume',
      }, 'agent');
      return { messageId: null, stepId };
    }
  }
}
