import { Trash2 } from 'lucide-react';
import type { ToolDefinition } from '../../types/settings';
import { SchemaEditorTabs } from './SchemaEditor/SchemaEditorTabs';

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

        {/* Schema Editor with tabs (Feature 1) */}
        <SchemaEditorTabs tool={tool} onUpdate={(updates) => onUpdate(tool.id, updates)} />

        {/* Default Result (Feature 2) */}
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Default Result</label>
          <textarea
            value={tool.defaultResult ?? ''}
            onChange={(e) => onUpdate(tool.id, { defaultResult: e.target.value })}
            placeholder='{"result": "example result"}'
            rows={2}
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] resize-none font-mono"
          />
        </div>

        {/* Approval & Interrupt Config (Feature 4) */}
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={tool.requiresApproval ?? false}
              onChange={(e) => onUpdate(tool.id, { requiresApproval: e.target.checked })}
              className="rounded"
            />
            Requires Approval
          </label>

          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={tool.interruptConfig?.enabled ?? false}
              onChange={(e) => onUpdate(tool.id, {
                interruptConfig: {
                  enabled: e.target.checked,
                  type: tool.interruptConfig?.type ?? 'approval',
                },
              })}
              className="rounded"
            />
            Has Interrupt
          </label>

          {tool.interruptConfig?.enabled && (
            <select
              value={tool.interruptConfig.type}
              onChange={(e) => onUpdate(tool.id, {
                interruptConfig: {
                  enabled: true,
                  type: e.target.value as 'approval' | 'user_input',
                },
              })}
              className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            >
              <option value="approval">Approval</option>
              <option value="user_input">User Input</option>
            </select>
          )}
        </div>
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
