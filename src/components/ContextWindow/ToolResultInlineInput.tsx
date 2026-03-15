import { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToolResultInlineInput() {
  const pending = useAppStore((s) => s.pendingToolInput);
  const resolveToolInput = useAppStore((s) => s.resolveToolInput);
  const [value, setValue] = useState(pending?.defaultResult ?? '');

  if (!pending) return null;

  return (
    <div className="ml-6 mr-2 mb-2 p-3 rounded-lg border border-[var(--border-secondary)] bg-[var(--surface-secondary)]/50">
      <div className="text-xs text-[var(--text-primary)] font-semibold mb-1">
        Tool Result for: {pending.toolName}
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-2 font-mono break-all">
        Args: {pending.toolArguments}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md p-2 text-xs text-[var(--text-primary)] font-mono resize-y min-h-[60px] focus:outline-none focus:border-[var(--border-secondary)]"
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => resolveToolInput(value)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-xs text-white hover:bg-blue-500 transition-colors"
        >
          <Send size={10} />
          Send to LLM
        </button>
        <button
          onClick={() => resolveToolInput(JSON.stringify({ error: `Tool ${pending.toolName} execution failed` }))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--border-primary)] bg-[var(--surface-tertiary)] text-xs text-[var(--text-secondary)] hover:border-[var(--border-secondary)] transition-colors"
        >
          <AlertTriangle size={10} />
          Error
        </button>
      </div>
    </div>
  );
}
