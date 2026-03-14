import type { MessageType } from '../../types/context';
import type { ActorId } from '../../types/sequence';
import type { ContextSlice } from './context-slice';
import type { SequenceSlice } from './sequence-slice';

type AppStore = ContextSlice & SequenceSlice;

interface ArrowMapping {
  from: ActorId;
  to: ActorId;
  labelOverride?: string;
  linked: boolean;
}

const MESSAGE_TO_ARROWS: Record<MessageType, ArrowMapping[] | null> = {
  system_prompt: null,
  user_message: [
    { from: 'frontend', to: 'backend', labelOverride: 'User request', linked: false },
    { from: 'backend', to: 'llm', linked: true },
  ],
  assistant_response: [
    { from: 'llm', to: 'backend', linked: true },
    { from: 'backend', to: 'frontend', labelOverride: 'Return response', linked: false },
  ],
  tool_call: [{ from: 'llm', to: 'tool', linked: true }],
  tool_result: [{ from: 'tool', to: 'llm', linked: true }],
};

export function syncOnMessageAdd(store: AppStore, messageId: string) {
  const message = store.messages.find((m) => m.id === messageId);
  if (!message) return;
  if (store._source === 'sync') return;

  const mappings = MESSAGE_TO_ARROWS[message.type];
  if (!mappings) return;

  for (const mapping of mappings) {
    const label = mapping.labelOverride ?? (message.content.slice(0, 50) || message.type);
    const stepId = store.addStep(mapping.from, mapping.to, label, {}, 'sync');

    if (mapping.linked) {
      store.linkStepToMessage(stepId, messageId);

      // Update message with step link
      const msgs = store.messages.map((m) =>
        m.id === messageId ? { ...m, linkedSequenceStepId: stepId } : m,
      );
      store.setMessages(msgs);
    }
  }
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
    const companionId = findCompanionStepId(store, linkedStepId);
    if (companionId) {
      store.removeStep(companionId, 'sync');
    }
    store.removeStep(linkedStepId, 'sync');
  }
}

export function syncOnStepRemove(store: AppStore, linkedMessageId: string | null) {
  if (linkedMessageId) {
    // The step being removed is linked — find it via its linkedContextMessageId
    const linkedStep = store.steps.find((s) => s.linkedContextMessageId === linkedMessageId);
    if (linkedStep) {
      const companionId = findCompanionStepId(store, linkedStep.id);
      if (companionId) {
        store.removeStep(companionId, 'sync');
      }
    }
    store.removeMessage(linkedMessageId, 'sync');
  }
}

function findCompanionStepId(store: AppStore, linkedStepId: string): string | null {
  const linkedStep = store.steps.find((s) => s.id === linkedStepId);
  if (!linkedStep) return null;

  for (const mappings of Object.values(MESSAGE_TO_ARROWS)) {
    if (!mappings) continue;

    const linkedIdx = mappings.findIndex(
      (m) => m.linked && m.from === linkedStep.from && m.to === linkedStep.to,
    );
    if (linkedIdx === -1) continue;

    const companionIdx = mappings.findIndex((m) => !m.linked);
    if (companionIdx === -1) return null;

    const companion = mappings[companionIdx];
    const companionIsBefore = companionIdx < linkedIdx;

    const sortedSteps = [...store.steps].sort((a, b) => a.order - b.order);
    const linkedPos = sortedSteps.findIndex((s) => s.id === linkedStep.id);
    if (linkedPos === -1) return null;

    const candidateIdx = companionIsBefore ? linkedPos - 1 : linkedPos + 1;
    if (candidateIdx < 0 || candidateIdx >= sortedSteps.length) return null;

    const candidate = sortedSteps[candidateIdx];
    if (
      candidate.from === companion.from &&
      candidate.to === companion.to &&
      !candidate.linkedContextMessageId
    ) {
      return candidate.id;
    }

    return null;
  }

  return null;
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
  // Only inside-context arrows create messages
  if (from === 'backend' && to === 'llm') return 'user_message';
  if (from === 'llm' && to === 'backend') return 'assistant_response';
  if (from === 'llm' && to === 'tool') return 'tool_call';
  if (from === 'tool' && to === 'llm') return 'tool_result';
  // Outside-context arrows don't create messages
  return null;
}
