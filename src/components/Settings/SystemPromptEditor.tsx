import { RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { resolveTemplate, extractVariables } from '../../utils/template';
import { formatToolsForPrompt } from '../../utils/tool-schema';

const DEFAULT_TEMPLATE = 'You are a helpful assistant.\n\nAvailable tools:\n{{tools}}';

export function SystemPromptEditor() {
  const template = useAppStore((s) => s.systemPromptTemplate);
  const setTemplate = useAppStore((s) => s.setSystemPromptTemplate);
  const tools = useAppStore((s) => s.toolDefinitions);

  const variables = extractVariables(template);
  const resolved = resolveTemplate(template, {
    tools: formatToolsForPrompt(tools),
  });

  const unresolvedVars = variables.filter((v) => v !== 'tools');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {variables.map((v) => (
            <span
              key={v}
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                v === 'tools'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {`{{${v}}}`}
            </span>
          ))}
        </div>
        <button
          onClick={() => setTemplate(DEFAULT_TEMPLATE)}
          className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          title="Reset to default"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        rows={6}
        className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono resize-y"
        placeholder="Enter system prompt template..."
      />
      {unresolvedVars.length > 0 && (
        <p className="text-xs text-yellow-400">
          Unresolved variables: {unresolvedVars.map((v) => `{{${v}}}`).join(', ')}
        </p>
      )}
      <div>
        <p className="text-xs text-[var(--text-tertiary)] mb-1">Preview</p>
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-40 overflow-y-auto">
          {resolved}
        </div>
      </div>
    </div>
  );
}
