import { Trash2 } from 'lucide-react';
import type { ToolDefinition } from '../../types/settings';

const NAME_PATTERN = /^[a-zA-Z_]\w*$/;

interface Props {
  tool: ToolDefinition;
  onUpdate: (id: string, updates: Partial<Omit<ToolDefinition, 'id'>>) => void;
  onRemove: (id: string) => void;
  isDuplicate: boolean;
}

export function ToolDefinitionCard({ tool, onUpdate, onRemove, isDuplicate }: Props) {
  const nameInvalid = tool.name.length > 0 && !NAME_PATTERN.test(tool.name);

  return (
    <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-primary)]">
      <div className="flex-1 space-y-2">
        <div>
          <input
            type="text"
            value={tool.name}
            onChange={(e) => onUpdate(tool.id, { name: e.target.value })}
            placeholder="tool_name"
            className={`w-full bg-[var(--surface-secondary)] border rounded px-2 py-1.5 text-sm text-[var(--text-primary)] font-mono ${
              nameInvalid || isDuplicate
                ? 'border-red-500'
                : 'border-[var(--border-primary)]'
            }`}
          />
          {nameInvalid && (
            <p className="text-xs text-red-400 mt-1">
              Must start with a letter or underscore, followed by word characters
            </p>
          )}
          {isDuplicate && (
            <p className="text-xs text-red-400 mt-1">Duplicate tool name</p>
          )}
        </div>
        <textarea
          value={tool.description}
          onChange={(e) => onUpdate(tool.id, { description: e.target.value })}
          placeholder="Describe what this tool does..."
          rows={2}
          className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)] resize-none"
        />
        <textarea
          value={tool.parametersJson ?? ''}
          onChange={(e) => onUpdate(tool.id, { parametersJson: e.target.value })}
          placeholder='{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}'
          rows={2}
          className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] resize-none font-mono"
        />
      </div>
      <button
        onClick={() => onRemove(tool.id)}
        className="p-1.5 rounded hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0 mt-1"
        title="Remove tool"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
