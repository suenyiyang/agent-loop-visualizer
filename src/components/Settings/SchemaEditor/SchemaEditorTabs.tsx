import { useState } from 'react';
import type { ToolDefinition } from '../../../types/settings';
import { JsonSchemaTab } from './JsonSchemaTab';
import { ZodCodeTab } from './ZodCodeTab';
import { VisualBuilderTab } from './VisualBuilderTab';

type TabId = 'json' | 'zod' | 'visual';

interface Props {
  tool: ToolDefinition;
  onUpdate: (updates: Partial<Omit<ToolDefinition, 'id'>>) => void;
}

export function SchemaEditorTabs({ tool, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('json');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'json', label: 'JSON' },
    { id: 'zod', label: 'Zod' },
    { id: 'visual', label: 'Visual' },
  ];

  return (
    <div>
      <div className="flex border-b border-[var(--border-primary)] mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'json' && (
        <JsonSchemaTab
          value={tool.parametersJson ?? ''}
          onChange={(v) => onUpdate({ parametersJson: v })}
        />
      )}
      {activeTab === 'zod' && (
        <ZodCodeTab
          zodCode={tool.zodCode ?? ''}
          onUpdate={(updates) => onUpdate(updates)}
        />
      )}
      {activeTab === 'visual' && (
        <VisualBuilderTab
          parametersJson={tool.parametersJson ?? ''}
          onUpdate={(json) => onUpdate({ parametersJson: json })}
        />
      )}
    </div>
  );
}
