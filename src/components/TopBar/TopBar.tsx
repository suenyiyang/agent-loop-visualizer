import { Workflow } from 'lucide-react';
import { ConnectorSettingsForm } from './ConnectorSettingsForm';
import { ExportImportButtons } from './ExportImportButtons';
import { RunAgentButton } from './RunAgentButton';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

export function TopBar() {
  const agentError = useAppStore((s) => s.agentError);

  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-[var(--surface-primary)] border-b border-[var(--border-primary)] shrink-0">
      <div className="flex items-center gap-2">
        <Workflow size={18} className="text-blue-400" />
        <h1 className="text-sm font-bold text-[var(--text-primary)]">Agent Loop Visualizer</h1>
      </div>
      <div className="flex items-center gap-3">
        {agentError && (
          <span className="text-xs text-red-400 max-w-xs truncate" title={agentError}>
            Error: {agentError}
          </span>
        )}
        <RunAgentButton />
        <ExportImportButtons />
        <ThemeToggle />
        <ConnectorSettingsForm />
      </div>
    </div>
  );
}
