import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ActorId, StepType } from '../../types/sequence';
import { DEFAULT_ACTORS } from '../../constants/actors';

interface StepEditorProps {
  stepId: string | null;
  onClose: () => void;
  onAddStep: (from: ActorId, to: ActorId, label: string, options?: {
    type?: StepType;
    isAsync?: boolean;
    wrapModelCall?: boolean;
    wrapToolCall?: boolean;
    interruptType?: 'approval' | 'user_input';
  }) => void;
}

export function StepEditor({ stepId, onClose, onAddStep }: StepEditorProps) {
  const step = useAppStore((s) => s.steps.find((st) => st.id === stepId));
  const updateStep = useAppStore((s) => s.updateStep);

  const [from, setFrom] = useState<ActorId>(step?.from ?? 'frontend');
  const [to, setTo] = useState<ActorId>(step?.to ?? 'backend');
  const [label, setLabel] = useState(step?.label ?? '');
  const [type, setType] = useState<StepType>(step?.type ?? 'message');
  const [isAsync, setIsAsync] = useState(step?.isAsync ?? false);
  const [wrapModelCall, setWrapModelCall] = useState(step?.wrapModelCall ?? false);
  const [wrapToolCall, setWrapToolCall] = useState(step?.wrapToolCall ?? false);
  const [interruptType, setInterruptType] = useState<'approval' | 'user_input'>(
    step?.interruptType ?? 'approval',
  );

  const handleSubmit = () => {
    if (stepId && step) {
      updateStep(stepId, {
        from, to, label, type, isAsync, wrapModelCall, wrapToolCall,
        interruptType: type === 'interrupt' ? interruptType : undefined,
      });
    } else {
      onAddStep(from, to, label, {
        type, isAsync, wrapModelCall, wrapToolCall,
        interruptType: type === 'interrupt' ? interruptType : undefined,
      });
    }
    onClose();
  };

  return (
    <div className="absolute top-12 right-4 z-30 w-72 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] rounded-lg shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {stepId ? 'Edit Step' : 'Add Step'}
        </h3>
        <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[var(--text-tertiary)] block mb-1">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as ActorId)}
              className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
            >
              {DEFAULT_ACTORS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-tertiary)] block mb-1">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as ActorId)}
              className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
            >
              {DEFAULT_ACTORS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-tertiary)] block mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Step label..."
            className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--text-tertiary)] block mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as StepType)}
            className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
          >
            <option value="message">Message</option>
            <option value="self_message">Self Message</option>
            <option value="interrupt">Interrupt</option>
            <option value="resume">Resume</option>
          </select>
        </div>

        {type === 'interrupt' && (
          <div>
            <label className="text-xs text-[var(--text-tertiary)] block mb-1">Interrupt Type</label>
            <select
              value={interruptType}
              onChange={(e) => setInterruptType(e.target.value as 'approval' | 'user_input')}
              className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
            >
              <option value="approval">Approval</option>
              <option value="user_input">User Input</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={isAsync}
              onChange={(e) => setIsAsync(e.target.checked)}
              className="rounded border-[var(--border-secondary)]"
            />
            Async (dashed line)
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={wrapModelCall}
              onChange={(e) => setWrapModelCall(e.target.checked)}
              className="rounded border-[var(--border-secondary)]"
            />
            wrapModelCall
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={wrapToolCall}
              onChange={(e) => setWrapToolCall(e.target.checked)}
              className="rounded border-[var(--border-secondary)]"
            />
            wrapToolCall
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-1.5 rounded transition-colors"
        >
          {stepId ? 'Update' : 'Add Step'}
        </button>
      </div>
    </div>
  );
}
