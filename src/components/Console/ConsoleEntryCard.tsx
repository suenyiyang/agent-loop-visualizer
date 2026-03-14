import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { JsonTree } from './JsonTree';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  entry: {
    id: string;
    timestamp: number;
    type: 'llm_request' | 'llm_response' | 'tool_call' | 'tool_result';
    rawJson: string;
    linkedContextMessageId: string | null;
    linkedSequenceStepId: string | null;
  };
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  llm_request: { label: 'REQ', color: 'bg-blue-600/40 text-blue-300' },
  llm_response: { label: 'RES', color: 'bg-green-600/40 text-green-300' },
  tool_call: { label: 'TOOL', color: 'bg-purple-600/40 text-purple-300' },
  tool_result: { label: 'RESULT', color: 'bg-amber-600/40 text-amber-300' },
};

export function ConsoleEntryCard({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const setFocus = useAppStore((s) => s.setFocus);

  const isFocused = focusTarget.consoleEntryId === entry.id;
  const badge = TYPE_BADGES[entry.type] ?? { label: entry.type, color: 'bg-gray-600/40 text-gray-300' };

  const parsed = useMemo(() => {
    try {
      return JSON.parse(entry.rawJson);
    } catch {
      return null;
    }
  }, [entry.rawJson]);

  const time = useMemo(() => {
    const d = new Date(entry.timestamp);
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [entry.timestamp]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocus({ consoleEntryId: entry.id });
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded border transition-colors cursor-pointer ${
        isFocused
          ? 'ring-2 ring-purple-400 border-purple-400 bg-purple-400/10'
          : 'border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 hover:border-[var(--border-secondary)]'
      }`}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
          {badge.label}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{time}</span>
        {!expanded && parsed && (
          <span className="flex-1 text-xs text-[var(--text-muted)] truncate font-mono">
            {entry.rawJson.slice(0, 80)}...
          </span>
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-2 text-xs font-mono overflow-x-auto">
          {parsed ? (
            <JsonTree data={parsed} highlighted={isFocused} />
          ) : (
            <pre className="text-[var(--text-secondary)] whitespace-pre-wrap">{entry.rawJson}</pre>
          )}
        </div>
      )}
    </div>
  );
}
