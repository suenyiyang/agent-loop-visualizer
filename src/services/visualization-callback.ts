import { useAppStore } from '../store/useAppStore';
import { syncOnMessageAdd } from '../store/slices/sync-middleware';

interface CallbackEvent {
  type: 'llm_start' | 'llm_end' | 'tool_start' | 'tool_end' | 'agent_end';
  content: string;
  toolName?: string;
}

export function handleVisualizationEvent(event: CallbackEvent) {
  const store = useAppStore.getState();

  switch (event.type) {
    case 'llm_start': {
      const id = store.addMessage('user_message', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), id);
      break;
    }
    case 'llm_end': {
      const id = store.addMessage('assistant_response', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), id);
      break;
    }
    case 'tool_start': {
      const id = store.addMessage('tool_call', event.content, 'agent');
      if (event.toolName) {
        store.updateMessage(id, { metadata: { toolName: event.toolName } });
      }
      syncOnMessageAdd(useAppStore.getState(), id);
      break;
    }
    case 'tool_end': {
      const id = store.addMessage('tool_result', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), id);
      break;
    }
    case 'agent_end': {
      const id = store.addMessage('assistant_response', event.content, 'agent');
      syncOnMessageAdd(useAppStore.getState(), id);
      break;
    }
  }
}
