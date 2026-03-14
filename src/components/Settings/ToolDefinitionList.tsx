import { Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ToolDefinitionCard } from './ToolDefinitionCard';

export function ToolDefinitionList() {
  const tools = useAppStore((s) => s.toolDefinitions);
  const addTool = useAppStore((s) => s.addToolDefinition);
  const updateTool = useAppStore((s) => s.updateToolDefinition);
  const removeTool = useAppStore((s) => s.removeToolDefinition);

  const nameCounts = new Map<string, number>();
  for (const t of tools) {
    if (t.name) nameCounts.set(t.name, (nameCounts.get(t.name) ?? 0) + 1);
  }

  return (
    <div className="space-y-3">
      {tools.map((tool) => (
        <ToolDefinitionCard
          key={tool.id}
          tool={tool}
          onUpdate={updateTool}
          onRemove={removeTool}
          isDuplicate={(nameCounts.get(tool.name) ?? 0) > 1}
        />
      ))}
      <button
        onClick={addTool}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-dashed border-[var(--border-secondary)] hover:border-blue-500/50 transition-colors text-xs text-[var(--text-secondary)]"
      >
        <Plus size={12} />
        Add Tool
      </button>
    </div>
  );
}
