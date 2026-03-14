import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToolResultInlineInput() {
  const pending = useAppStore((s) => s.pendingToolInput);
  const resolveToolInput = useAppStore((s) => s.resolveToolInput);
  const [value, setValue] = useState(pending?.defaultResult ?? '');

  if (!pending) return null;

  return (
    <div className="ml-6 mr-2 mb-2 p-3 rounded-lg border border-amber-700/50 bg-amber-900/20">
      <div className="text-xs text-amber-300 font-semibold mb-1">
        Tool Result for: {pending.toolName}
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-2 font-mono break-all">
        Args: {pending.toolArguments}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md p-2 text-xs text-[var(--text-primary)] font-mono resize-y min-h-[60px] focus:outline-none focus:border-amber-500"
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => resolveToolInput(value)}
          className="flex items-center gap-1 px-3 py-1 rounded bg-green-700/50 border border-green-600 text-xs text-green-300 hover:border-green-400 transition-colors"
        >
          <Send size={10} />
          Send to LLM
        </button>
        <button
          onClick={() => resolveToolInput(JSON.stringify({ error: `Tool ${pending.toolName} was rejected by user` }))}
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-900/50 border border-red-700 text-xs text-red-300 hover:border-red-500 transition-colors"
        >
          <X size={10} />
          Reject
        </button>
      </div>
    </div>
  );
}
