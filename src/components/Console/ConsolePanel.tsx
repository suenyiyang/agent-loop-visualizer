import { useRef } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ConsoleEntryCard } from './ConsoleEntryCard';
import type { ConsoleEntry } from '../../store/slices/console-slice';

function isConsoleEntryArray(data: unknown): data is ConsoleEntry[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.timestamp === 'number' &&
      typeof item.type === 'string' &&
      typeof item.rawJson === 'string',
  );
}

export function ConsolePanel() {
  const entries = useAppStore((s) => s.consoleEntries);
  const clearConsole = useAppStore((s) => s.clearConsole);
  const setConsoleEntries = useAppStore((s) => s.setConsoleEntries);
  const clearFocus = useAppStore((s) => s.clearFocus);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!isConsoleEntryArray(data)) {
          alert('Invalid console log format');
          return;
        }
        setConsoleEntries(data);
      } catch {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  const btnClass =
    'p-1 rounded hover:bg-[var(--surface-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors';

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--border-primary)]">
        <h2 className="text-xs font-semibold text-[var(--text-primary)]">Console</h2>
        <div className="flex items-center gap-0.5">
          <button onClick={handleExport} className={btnClass} title="Export console log">
            <Download size={12} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Import console log">
            <Upload size={12} />
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={clearConsole} className={btnClass} title="Clear console">
            <Trash2 size={12} />
          </button>
        </div>
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
