import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { MESSAGE_TYPES, MESSAGE_TYPE_CONFIG } from '../../constants/message-types';
import { Badge } from '../shared/Badge';
import { useAppStore } from '../../store/useAppStore';
import { resolveTemplate } from '../../utils/template';
import { formatToolsForPrompt } from '../../utils/tool-schema';
import type { MessageType } from '../../types/context';

interface MessagePaletteProps {
  onAdd: (type: MessageType, content?: string) => void;
}

export function MessagePalette({ onAdd }: MessagePaletteProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const templates = useAppStore((s) => s.systemPromptTemplates);
  const toolDefinitions = useAppStore((s) => s.toolDefinitions);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const handleSysClick = () => {
    setShowPicker((v) => !v);
  };

  const handlePickTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    const content = tpl
      ? resolveTemplate(tpl.template, { tools: formatToolsForPrompt(toolDefinitions) })
      : '';
    onAdd('system_prompt', content);
    setShowPicker(false);
  };

  return (
    <div className="px-4 py-3 border-b border-[var(--border-primary)]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-[var(--text-muted)] mr-1">Add:</span>
        {MESSAGE_TYPES.map((type) => {
          const config = MESSAGE_TYPE_CONFIG[type];

          if (type === 'system_prompt') {
            return (
              <div key={type} className="relative" ref={pickerRef}>
                <button
                  onClick={handleSysClick}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs"
                  title={`Add ${config.label}`}
                >
                  <Plus size={10} className="text-[var(--text-tertiary)]" />
                  <Badge label={config.shortLabel} color={config.color} size="sm" />
                  <ChevronDown size={10} className="text-[var(--text-tertiary)]" />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl overflow-hidden">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handlePickTemplate(tpl.id)}
                        className="w-full text-left px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors"
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs"
              title={`Add ${config.label}`}
            >
              <Plus size={10} className="text-[var(--text-tertiary)]" />
              <Badge label={config.shortLabel} color={config.color} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
