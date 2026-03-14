import type { MessageType } from '../../types/context';
import type { ActorId } from '../../types/sequence';
import type { ContextSlice } from './context-slice';
import type { SequenceSlice } from './sequence-slice';

type AppStore = ContextSlice & SequenceSlice;

const MESSAGE_TO_ARROW: Record<MessageType, { from: ActorId; to: ActorId } | null> = {
  system_prompt: null,
  user_message: { from: 'frontend', to: 'backend' },
  assistant_response: { from: 'llm', to: 'backend' },
  tool_call: { from: 'llm', to: 'tool' },
  tool_result: { from: 'tool', to: 'llm' },
};

export function syncOnMessageAdd(store: AppStore, messageId: string) {
  const message = store.messages.find((m) => m.id === messageId);
  if (!message) return;
  if (store._source === 'sync') return;

  const mapping = MESSAGE_TO_ARROW[message.type];
  if (!mapping) return;

  const stepId = store.addStep(mapping.from, mapping.to, message.content.slice(0, 50) || message.type, {
    wrapModelCall: message.type === 'user_message' || message.type === 'assistant_response' ? undefined : undefined,
    wrapToolCall: message.type === 'tool_call' || message.type === 'tool_result' ? undefined : undefined,
  }, 'sync');

  store.linkMessageToStep(messageId, message.id);
  store.linkStepToMessage(stepId, messageId);

  // Update message with step link
  const msgs = store.messages.map((m) =>
    m.id === messageId ? { ...m, linkedSequenceStepId: stepId } : m,
  );
  // Direct set to avoid recursion - we set _source: 'sync'
  store.setMessages(msgs);
}

export function syncOnStepAdd(store: AppStore, stepId: string) {
  const step = store.steps.find((s) => s.id === stepId);
  if (!step) return;
  if (store._seqSource === 'sync') return;

  const arrowToMessage = findMessageTypeForArrow(step.from, step.to);
  if (!arrowToMessage) return;

  const messageId = store.addMessage(arrowToMessage, step.label, 'sync');

  store.linkStepToMessage(stepId, messageId);

  const steps = store.steps.map((s) =>
    s.id === stepId ? { ...s, linkedContextMessageId: messageId } : s,
  );
  store.setSteps(steps);
}

export function syncOnMessageRemove(store: AppStore, linkedStepId: string | null) {
  if (linkedStepId) {
    store.removeStep(linkedStepId, 'sync');
  }
}

export function syncOnStepRemove(store: AppStore, linkedMessageId: string | null) {
  if (linkedMessageId) {
    store.removeMessage(linkedMessageId, 'sync');
  }
}

export function syncOnMessageReorder(store: AppStore) {
  const messages = store.messages;
  const steps = [...store.steps];

  // Build a map from step id -> new order based on linked message position
  const messageOrderMap = new Map<string, number>();
  messages.forEach((msg, idx) => {
    if (msg.linkedSequenceStepId) {
      messageOrderMap.set(msg.linkedSequenceStepId, idx);
    }
  });

  // Reorder steps: linked steps get their order from the message, unlinked stay in place
  const reordered = steps.map((s) => {
    const newOrder = messageOrderMap.get(s.id);
    return newOrder != null ? { ...s, order: newOrder } : s;
  });

  store.setSteps(reordered);
}

function findMessageTypeForArrow(from: ActorId, to: ActorId): MessageType | null {
  if (from === 'frontend' && to === 'backend') return 'user_message';
  if (from === 'backend' && to === 'llm') return 'user_message';
  if (from === 'llm' && to === 'backend') return 'assistant_response';
  if (from === 'llm' && to === 'frontend') return 'assistant_response';
  if (from === 'llm' && to === 'tool') return 'tool_call';
  if (from === 'tool' && to === 'llm') return 'tool_result';
  return null;
}
