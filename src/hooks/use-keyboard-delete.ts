import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  syncOnMessageRemove,
  syncOnStepRemove,
} from '../store/slices/sync-middleware';

interface DialogState {
  title: string;
  message: string;
  onConfirm: () => void;
}

export function useKeyboardDelete() {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const state = useAppStore.getState();

      if (state.selectedMessageId) {
        const msg = state.messages.find((m) => m.id === state.selectedMessageId);
        if (!msg) return;
        e.preventDefault();
        setDialog({
          title: 'Delete message?',
          message: `Remove this ${msg.type.replace('_', ' ')} and its linked step?`,
          onConfirm: () => {
            const s = useAppStore.getState();
            const m = s.messages.find((x) => x.id === state.selectedMessageId);
            if (m) {
              syncOnMessageRemove(s, m.linkedSequenceStepId);
              s.removeMessage(m.id);
            }
            setDialog(null);
          },
        });
        return;
      }

      if (state.selectedStepId) {
        const step = state.steps.find((s) => s.id === state.selectedStepId);
        if (!step) return;
        e.preventDefault();
        setDialog({
          title: 'Delete step?',
          message: `Remove step "${step.label || step.type}" and its linked message?`,
          onConfirm: () => {
            const s = useAppStore.getState();
            const st = s.steps.find((x) => x.id === state.selectedStepId);
            if (st) {
              syncOnStepRemove(s, st.linkedContextMessageId);
              s.removeStep(st.id);
            }
            setDialog(null);
          },
        });
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const confirmDialog = useCallback(() => {
    dialog?.onConfirm();
  }, [dialog]);

  const cancelDialog = useCallback(() => {
    setDialog(null);
  }, []);

  return { dialog, confirmDialog, cancelDialog };
}
