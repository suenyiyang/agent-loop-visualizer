import { useState, useRef, useEffect } from 'react';
import { useTokenCounter } from '../../hooks/useTokenCounter';
import { useAppStore } from '../../store/useAppStore';
import { MESSAGE_TYPE_CONFIG } from '../../constants/message-types';
import type { MessageType } from '../../types/context';

const PRESETS = [
  { label: '4K', value: 4_000 },
  { label: '8K', value: 8_000 },
  { label: '16K', value: 16_000 },
  { label: '32K', value: 32_000 },
  { label: '64K', value: 64_000 },
  { label: '128K', value: 128_000 },
  { label: '200K', value: 200_000 },
  { label: '1M', value: 1_000_000 },
];

export function TokenUsageBar() {
  const { totalTokens, tokenLimit, usagePercent, tokensByType } = useTokenCounter();
  const setTokenLimit = useAppStore((s) => s.setTokenLimit);
  const [editing, setEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!showPresets) return;
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPresets]);

  const startEdit = () => {
    setDraft(tokenLimit.toString());
    setEditing(true);
    setShowPresets(false);
  };

  const commitEdit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setTokenLimit(parsed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const selectPreset = (value: number) => {
    setTokenLimit(value);
    setShowPresets(false);
    setEditing(false);
  };

  return (
    <div className="px-4 py-3 border-b border-[var(--border-primary)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--text-tertiary)]">Context Window</span>
        <span className="text-xs font-mono text-[var(--text-tertiary)] flex items-center gap-1">
          {totalTokens.toLocaleString()} /{' '}
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              onBlur={commitEdit}
              className="w-20 bg-[var(--surface-primary)] border border-blue-400 rounded px-1 text-xs text-[var(--text-primary)] font-mono focus:outline-none"
            />
          ) : (
            <span className="relative">
              <button
                onClick={startEdit}
                className="hover:text-[var(--text-primary)] underline decoration-dotted cursor-pointer"
                title="Click to edit token limit"
              >
                {tokenLimit.toLocaleString()}
              </button>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="ml-1 hover:text-[var(--text-primary)] cursor-pointer"
                title="Preset limits"
              >
                ▾
              </button>
              {showPresets && (
                <div ref={presetsRef} className="absolute right-0 top-5 z-20 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-md shadow-lg py-1 min-w-[80px]">
                  {PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => selectPreset(p.value)}
                      className={`block w-full text-left px-3 py-1 text-xs hover:bg-[var(--surface-tertiary)] ${
                        p.value === tokenLimit ? 'text-blue-400 font-semibold' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </span>
          )}{' '}
          tokens
        </span>
      </div>
      <div className="h-3 bg-[var(--surface-tertiary)] rounded-full overflow-hidden flex">
        {(Object.entries(tokensByType) as [MessageType, number][]).map(([type, count]) => {
          const pct = tokenLimit > 0 ? (count / tokenLimit) * 100 : 0;
          if (pct < 0.1) return null;
          return (
            <div
              key={type}
              className="h-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: MESSAGE_TYPE_CONFIG[type]?.color ?? '#64748b',
              }}
              title={`${MESSAGE_TYPE_CONFIG[type]?.label}: ${count} tokens`}
            />
          );
        })}
      </div>
      {usagePercent > 80 && (
        <p className="text-xs mt-1 text-amber-400">
          {usagePercent >= 100 ? 'Token limit exceeded!' : 'Approaching token limit'}
        </p>
      )}
    </div>
  );
}
