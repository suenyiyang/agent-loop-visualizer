import { useCallback, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '../../store/useAppStore';
import { syncOnMessageReorder } from '../../store/slices/sync-middleware';
import { TokenUsageBar } from './TokenUsageBar';
import { MessagePalette } from './MessagePalette';
import { MessageBlock } from './MessageBlock';
import { SystemPromptPickerDialog } from './SystemPromptPickerDialog';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import type { MessageType } from '../../types/context';

interface PendingAdd {
  type: MessageType;
  content?: string;
}

export function ContextWindowPanel() {
  const messages = useAppStore((s) => s.messages);
  const selectedStepId = useAppStore((s) => s.selectedStepId);
  const selectedMessageId = useAppStore((s) => s.selectedMessageId);
  const selectStep = useAppStore((s) => s.selectStep);
  const selectMessage = useAppStore((s) => s.selectMessage);
  const reorderMessages = useAppStore((s) => s.reorderMessages);
  const { handleAddFromPalette } = useDragAndDrop();
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      reorderMessages(active.id as string, over.id as string);
      syncOnMessageReorder(useAppStore.getState());
    },
    [reorderMessages],
  );

  const handleAdd = useCallback(
    (type: MessageType, content?: string) => {
      // When adding user_message with no system prompt, ask the user first
      const hasSystemPrompt = useAppStore.getState().messages.some(
        (m) => m.type === 'system_prompt',
      );
      if (type === 'user_message' && !hasSystemPrompt) {
        setPendingAdd({ type, content });
        return;
      }
      handleAddFromPalette(type, content);
    },
    [handleAddFromPalette],
  );

  const handlePickSystemPrompt = useCallback(
    (resolvedContent: string) => {
      // Add the system prompt first, then the pending user message
      handleAddFromPalette('system_prompt', resolvedContent);
      if (pendingAdd) {
        handleAddFromPalette(pendingAdd.type, pendingAdd.content);
      }
      setPendingAdd(null);
    },
    [handleAddFromPalette, pendingAdd],
  );

  const handleSkipSystemPrompt = useCallback(() => {
    // Just add the pending user message without a system prompt
    if (pendingAdd) {
      handleAddFromPalette(pendingAdd.type, pendingAdd.content);
    }
    setPendingAdd(null);
  }, [handleAddFromPalette, pendingAdd]);

  const handleSelectMessage = useCallback(
    (msg: { id: string; linkedSequenceStepId: string | null }) => {
      selectMessage(msg.id);
      selectStep(msg.linkedSequenceStepId);
    },
    [selectStep, selectMessage],
  );

  const handleBackgroundClick = useCallback(() => {
    selectMessage(null);
  }, [selectMessage]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)]">
      <div className="px-4 py-2 border-b border-[var(--border-primary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Context List</h2>
      </div>
      <TokenUsageBar />
      <MessagePalette onAdd={handleAdd} />
      <div className="flex-1 overflow-y-auto p-4" onClick={handleBackgroundClick}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={messages.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {messages.map((msg) => (
                <MessageBlock
                  key={msg.id}
                  message={msg}
                  isHighlighted={msg.linkedSequenceStepId === selectedStepId && selectedStepId !== null}
                  isSelected={msg.id === selectedMessageId}
                  onSelect={() => handleSelectMessage(msg)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">
            Add messages using the palette above
          </div>
        )}
      </div>
      <SystemPromptPickerDialog
        open={pendingAdd !== null}
        onSelect={handlePickSystemPrompt}
        onSkip={handleSkipSystemPrompt}
      />
    </div>
  );
}
