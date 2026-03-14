import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ConsoleEntryCard } from './ConsoleEntryCard';

export function ConsolePanel() {
  const entries = useAppStore((s) => s.consoleEntries);
  const clearConsole = useAppStore((s) => s.clearConsole);
  const clearFocus = useAppStore((s) => s.clearFocus);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--border-primary)]">
        <h2 className="text-xs font-semibold text-[var(--text-primary)]">Console</h2>
        <button
          onClick={clearConsole}
          className="p-1 rounded hover:bg-[var(--surface-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          title="Clear console"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1"
        onClick={() => clearFocus()}
      >
        {entries.map((entry) => (
          <ConsoleEntryCard key={entry.id} entry={entry} />
        ))}
        {entries.length === 0 && (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">
            Run the agent to see raw JSON here
          </div>
        )}
      </div>
    </div>
  );
}
