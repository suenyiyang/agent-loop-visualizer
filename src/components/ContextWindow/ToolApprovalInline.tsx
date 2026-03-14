import { Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToolApprovalInline() {
  const pending = useAppStore((s) => s.pendingApproval);
  const resolveApproval = useAppStore((s) => s.resolveApproval);

  if (!pending) return null;

  return (
    <div className="ml-6 mr-2 mb-2 p-3 rounded-lg border border-blue-700/50 bg-blue-900/20">
      <div className="text-xs text-blue-300 font-semibold mb-1">
        Approval Required: {pending.toolName}
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-2 font-mono break-all">
        Args: {pending.toolArguments}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => resolveApproval(true)}
          className="flex items-center gap-1 px-3 py-1 rounded bg-green-700/50 border border-green-600 text-xs text-green-300 hover:border-green-400 transition-colors"
        >
          <Check size={10} />
          Approve
        </button>
        <button
          onClick={() => resolveApproval(false)}
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-900/50 border border-red-700 text-xs text-red-300 hover:border-red-500 transition-colors"
        >
          <X size={10} />
          Reject
        </button>
      </div>
    </div>
  );
}
