import { Workflow, Settings, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { RunAgentButton } from './RunAgentButton';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

export function TopBar() {
  const agentError = useAppStore((s) => s.agentError);
  const { pathname } = useLocation();
  const onSettings = pathname === '/settings';

  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-[var(--surface-primary)] border-b border-[var(--border-primary)] shrink-0">
      <div className="flex items-center gap-2">
        {onSettings ? (
          <Link to="/" className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs">
            <ArrowLeft size={14} />
            Back
          </Link>
        ) : (
          <>
            <Workflow size={18} className="text-blue-400" />
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Agent Loop Visualizer</h1>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {agentError && (
          <span className="text-xs text-red-400 max-w-xs truncate" title={agentError}>
            Error: {agentError}
          </span>
        )}
        {!onSettings && <RunAgentButton />}
        <ThemeToggle />
        {!onSettings && (
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
          >
            <Settings size={12} />
            Settings
          </Link>
        )}
      </div>
    </div>
  );
}
