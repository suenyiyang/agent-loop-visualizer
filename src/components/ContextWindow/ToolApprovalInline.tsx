import { Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToolApprovalInline() {
  const pending = useAppStore((s) => s.pendingApproval);
  const resolveApproval = useAppStore((s) => s.resolveApproval);

  if (!pending) return null;

  return (
    <div className="ml-6 mr-2 mb-2 p-3 rounded-lg border border-[var(--border-secondary)] bg-[var(--surface-secondary)]/50">
      <div className="text-xs text-[var(--text-primary)] font-semibold mb-1">
        Approval Required: {pending.toolName}
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-2 font-mono break-all">
        Args: {pending.toolArguments}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => resolveApproval(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-xs text-white hover:bg-blue-500 transition-colors"
        >
          <Check size={10} />
          Approve
        </button>
        <button
          onClick={() => resolveApproval(false)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--border-primary)] bg-[var(--surface-tertiary)] text-xs text-[var(--text-secondary)] hover:border-[var(--border-secondary)] transition-colors"
        >
          <X size={10} />
          Reject
        </button>
      </div>
    </div>
  );
}
