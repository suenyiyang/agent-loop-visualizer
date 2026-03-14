import { FileText, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { resolveTemplate } from '../../utils/template';
import { formatToolsForPrompt } from '../../utils/tool-schema';

interface SystemPromptPickerDialogProps {
  open: boolean;
  onSelect: (resolvedContent: string) => void;
  onSkip: () => void;
}

export function SystemPromptPickerDialog({ open, onSelect, onSkip }: SystemPromptPickerDialogProps) {
  const templates = useAppStore((s) => s.systemPromptTemplates);
  const toolDefinitions = useAppStore((s) => s.toolDefinitions);

  if (!open) return null;

  const handlePick = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    const content = tpl
      ? resolveTemplate(tpl.template, { tools: formatToolsForPrompt(toolDefinitions) })
      : '';
    onSelect(content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onSkip}>
      <div
        className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg p-5 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Add a system prompt?
          </h3>
          <button
            onClick={onSkip}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          No system prompt in context. Select a template or skip.
        </p>
        <div className="space-y-1.5 mb-4">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handlePick(tpl.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors"
            >
              <FileText size={14} className="text-purple-400 shrink-0" />
              <span className="truncate">{tpl.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onSkip}
          className="w-full px-3 py-2 rounded-md text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors"
        >
          Skip — no system prompt
        </button>
      </div>
    </div>
  );
}
