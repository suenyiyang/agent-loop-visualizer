import type { StateCreator } from 'zustand';
import type { ContextMessage, MessageType } from '../../types/context';
import { generateId } from '../../utils/id-generator';
import { countTokens } from '../../services/tokenizer';
import { DEFAULT_TOKEN_LIMIT } from '../../constants/defaults';

export interface ContextSlice {
  messages: ContextMessage[];
  tokenLimit: number;
  selectedMessageId: string | null;
  _source: 'user' | 'sync' | 'agent';

  addMessage: (type: MessageType, content: string, source?: 'user' | 'sync' | 'agent') => string;
  updateMessage: (id: string, updates: Partial<Pick<ContextMessage, 'content' | 'type' | 'metadata'>>) => void;
  removeMessage: (id: string, source?: 'user' | 'sync' | 'agent') => void;
  reorderMessages: (activeId: string, overId: string) => void;
  setTokenLimit: (limit: number) => void;
  setTokenCount: (id: string, count: number, manual: boolean) => void;
  linkMessageToStep: (messageId: string, stepId: string) => void;
  setMessages: (messages: ContextMessage[]) => void;
  selectMessage: (id: string | null) => void;
}

export const createContextSlice: StateCreator<ContextSlice, [], [], ContextSlice> = (set, get) => ({
  messages: [],
  tokenLimit: DEFAULT_TOKEN_LIMIT,
  selectedMessageId: null,
  _source: 'user',

  addMessage: (type, content, source = 'user') => {
    const id = generateId();
    const tokenCount = countTokens(content);
    const message: ContextMessage = {
      id,
      type,
      content,
      tokenCount,
      tokenCountManual: false,
      linkedSequenceStepId: null,
    };
    set({ messages: [...get().messages, message], _source: source });
    return id;
  },

  updateMessage: (id, updates) => {
    set({
      messages: get().messages.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        if (updates.content != null && !m.tokenCountManual) {
          updated.tokenCount = countTokens(updates.content);
        }
        return updated;
      }),
      _source: 'user',
    });
  },

  removeMessage: (id, source = 'user') => {
    const state = get();
    set({
      messages: state.messages.filter((m) => m.id !== id),
      selectedMessageId: state.selectedMessageId === id ? null : state.selectedMessageId,
      _source: source,
    });
  },

  reorderMessages: (activeId, overId) => {
    const msgs = [...get().messages];
    const oldIdx = msgs.findIndex((m) => m.id === activeId);
    const newIdx = msgs.findIndex((m) => m.id === overId);
    if (oldIdx === -1 || newIdx === -1) return;
    const [moved] = msgs.splice(oldIdx, 1);
    msgs.splice(newIdx, 0, moved);
    set({ messages: msgs, _source: 'user' });
  },

  setTokenLimit: (limit) => set({ tokenLimit: limit }),

  setTokenCount: (id, count, manual) => {
    set({
      messages: get().messages.map((m) =>
        m.id === id ? { ...m, tokenCount: count, tokenCountManual: manual } : m,
      ),
    });
  },

  linkMessageToStep: (messageId, stepId) => {
    set({
      messages: get().messages.map((m) =>
        m.id === messageId ? { ...m, linkedSequenceStepId: stepId } : m,
      ),
    });
  },

  setMessages: (messages) => set({ messages, _source: 'sync' }),

  selectMessage: (id) => set({ selectedMessageId: id }),
});
