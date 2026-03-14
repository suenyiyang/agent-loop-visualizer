import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { useAppStore, type AppStore } from '../store/useAppStore';
import type { MessageType } from '../types/context';
import {
  syncOnMessageAdd,
  syncOnStepAdd,
} from '../store/slices/sync-middleware';

export function useDragAndDrop() {
  const store = useAppStore;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const state = store.getState();

      // Palette drop: active.data contains message type
      const activeData = active.data.current;
      if (activeData?.fromPalette) {
        const messageId = state.addMessage(
          activeData.messageType as MessageType,
          '',
          'user',
        );
        syncOnMessageAdd(store.getState(), messageId);
        return;
      }

      // Reorder within list
      if (active.id !== over.id) {
        state.reorderMessages(active.id as string, over.id as string);
      }
    },
    [store],
  );

  const handleAddFromPalette = useCallback(
    (type: MessageType) => {
      const state = store.getState();
      const messageId = state.addMessage(type, '', 'user');
      syncOnMessageAdd(store.getState(), messageId);
    },
    [store],
  );

  const handleAddStep = useCallback(
    (...args: Parameters<AppStore['addStep']>) => {
      const state = store.getState();
      const stepId = state.addStep(...args);
      syncOnStepAdd(store.getState(), stepId);
      return stepId;
    },
    [store],
  );

  return { handleDragEnd, handleAddFromPalette, handleAddStep };
}
