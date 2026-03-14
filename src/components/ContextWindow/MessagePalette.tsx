import { Plus } from 'lucide-react';
import { MESSAGE_TYPES } from '../../constants/message-types';
import { MESSAGE_TYPE_CONFIG } from '../../constants/message-types';
import { Badge } from '../shared/Badge';
import type { MessageType } from '../../types/context';

interface MessagePaletteProps {
  onAdd: (type: MessageType) => void;
}

export function MessagePalette({ onAdd }: MessagePaletteProps) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border-primary)]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-[var(--text-muted)] mr-1">Add:</span>
        {MESSAGE_TYPES.map((type) => {
          const config = MESSAGE_TYPE_CONFIG[type];
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
