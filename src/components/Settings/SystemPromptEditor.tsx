import { Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { resolveTemplate, extractVariables } from '../../utils/template';
import { formatToolsForPrompt } from '../../utils/tool-schema';
import type { SystemPromptTemplate } from '../../types/settings';

function TemplateCard({
  tpl,
  onUpdate,
  onRemove,
  tools,
  canRemove,
}: {
  tpl: SystemPromptTemplate;
  onUpdate: (id: string, updates: Partial<Omit<SystemPromptTemplate, 'id'>>) => void;
  onRemove: (id: string) => void;
  tools: string;
  canRemove: boolean;
}) {
  const variables = extractVariables(tpl.template);
  const resolved = resolveTemplate(tpl.template, { tools });
  const unresolvedVars = variables.filter((v) => v !== 'tools');

  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={tpl.name}
          onChange={(e) => onUpdate(tpl.id, { name: e.target.value })}
          className="flex-1 bg-transparent border-none text-sm font-medium text-[var(--text-primary)] focus:outline-none"
          placeholder="Template name..."
        />
        <div className="flex items-center gap-1 flex-wrap">
          {variables.map((v) => (
            <span
              key={v}
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                v === 'tools'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {`{{${v}}}`}
            </span>
          ))}
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(tpl.id)}
            className="p-1 rounded hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
            title="Remove template"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <textarea
        value={tpl.template}
        onChange={(e) => onUpdate(tpl.id, { template: e.target.value })}
        rows={4}
        className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] font-mono resize-y"
        placeholder="Enter system prompt template..."
      />
      {unresolvedVars.length > 0 && (
        <p className="text-xs text-yellow-400">
          Unresolved variables: {unresolvedVars.map((v) => `{{${v}}}`).join(', ')}
        </p>
      )}
      <details className="text-xs">
        <summary className="text-[var(--text-tertiary)] cursor-pointer select-none">
          Preview
        </summary>
        <div className="mt-1 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-32 overflow-y-auto">
          {resolved}
        </div>
      </details>
    </div>
  );
}

export function SystemPromptEditor() {
  const templates = useAppStore((s) => s.systemPromptTemplates);
  const addTemplate = useAppStore((s) => s.addSystemPromptTemplate);
  const updateTemplate = useAppStore((s) => s.updateSystemPromptTemplate);
  const removeTemplate = useAppStore((s) => s.removeSystemPromptTemplate);
  const tools = useAppStore((s) => s.toolDefinitions);

  const toolsString = formatToolsForPrompt(tools);

  return (
    <div className="space-y-3">
      {templates.map((tpl) => (
        <TemplateCard
          key={tpl.id}
          tpl={tpl}
          onUpdate={updateTemplate}
          onRemove={removeTemplate}
          tools={toolsString}
          canRemove={templates.length > 1}
        />
      ))}
      <button
        onClick={() => addTemplate()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-dashed border-[var(--border-secondary)] hover:border-blue-500/50 transition-colors text-xs text-[var(--text-secondary)]"
      >
        <Plus size={12} />
        Add Template
      </button>
    </div>
  );
}
