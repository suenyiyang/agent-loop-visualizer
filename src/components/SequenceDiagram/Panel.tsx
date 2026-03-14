import { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SvgCanvas } from './SvgCanvas';
import { StepEditor } from './StepEditor';
import { useAppStore } from '../../store/useAppStore';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import {
  syncOnStepRemove,
} from '../../store/slices/sync-middleware';
import type { ActorId, StepType } from '../../types/sequence';

export function SequenceDiagramPanel() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const selectedStepId = useAppStore((s) => s.selectedStepId);
  const removeStep = useAppStore((s) => s.removeStep);
  const steps = useAppStore((s) => s.steps);
  const { handleAddStep } = useDragAndDrop();

  const handleAdd = useCallback(
    (from: ActorId, to: ActorId, label: string, options?: {
      type?: StepType;
      isAsync?: boolean;
      wrapModelCall?: boolean;
      wrapToolCall?: boolean;
      interruptType?: 'approval' | 'user_input';
    }) => {
      handleAddStep(from, to, label, options);
    },
    [handleAddStep],
  );

  const handleDeleteSelected = useCallback(() => {
    if (!selectedStepId) return;
    const state = useAppStore.getState();
    const step = state.steps.find((s) => s.id === selectedStepId);
    syncOnStepRemove(state, step?.linkedContextMessageId ?? null);
    removeStep(selectedStepId);
  }, [selectedStepId, removeStep]);

  const handleEditStep = useCallback(() => {
    if (selectedStepId) {
      setEditingStepId(selectedStepId);
      setShowEditor(true);
    }
  }, [selectedStepId]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)] relative">
      <div className="px-4 py-2 border-b border-[var(--border-primary)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sequence Diagram</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setEditingStepId(null); setShowEditor(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
            title="Add step"
          >
            <Plus size={12} />
            Step
          </button>
          {selectedStepId && (
            <>
              <button
                onClick={handleEditStep}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
                title="Edit selected step"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-secondary)] border border-red-800 hover:border-red-600 transition-colors text-xs text-red-400"
                title="Delete selected step"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {steps.length > 0 ? (
          <SvgCanvas />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
            Add steps using the + button above
          </div>
        )}
      </div>

      {showEditor && (
        <StepEditor
          stepId={editingStepId}
          onClose={() => setShowEditor(false)}
          onAddStep={handleAdd}
        />
      )}
    </div>
  );
}
