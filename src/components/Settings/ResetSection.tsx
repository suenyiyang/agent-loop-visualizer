import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ConfirmDialog } from '../shared/ConfirmDialog';

export function ResetSection() {
  const [showConfirm, setShowConfirm] = useState(false);

  const resetContextData = useAppStore((s) => s.resetContextData);
  const resetSequenceData = useAppStore((s) => s.resetSequenceData);
  const resetSettings = useAppStore((s) => s.resetSettings);
  const resetConnectorSettings = useAppStore((s) => s.resetConnectorSettings);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-colors"
      >
        <Trash2 size={16} />
        Reset All
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Reset All"
        message="This will reset everything to defaults: context messages, diagram steps, system prompt, tool definitions, and connector settings."
        onConfirm={() => {
          resetContextData();
          resetSequenceData();
          resetSettings();
          resetConnectorSettings();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
