import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { MESSAGE_TYPE_CONFIG } from '../../constants/message-types';
import { useAppStore } from '../../store/useAppStore';
import { countTokensDebounced } from '../../services/tokenizer';
import {
  syncOnMessageRemove,
} from '../../store/slices/sync-middleware';
import type { ContextMessage } from '../../types/context';

interface MessageBlockProps {
  message: ContextMessage;
  isHighlighted: boolean;
  isSelected: boolean;
  isFocused?: boolean;
  onSelect: () => void;
}

export function MessageBlock({ message, isHighlighted, isSelected, isFocused, onSelect }: MessageBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const updateMessage = useAppStore((s) => s.updateMessage);
  const removeMessage = useAppStore((s) => s.removeMessage);
  const setTokenCount = useAppStore((s) => s.setTokenCount);
  const config = MESSAGE_TYPE_CONFIG[message.type];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (expanded && textRef.current) {
      textRef.current.focus();
    }
  }, [expanded]);

  const handleContentChange = (value: string) => {
    updateMessage(message.id, { content: value });
    if (!message.tokenCountManual) {
      countTokensDebounced(value, (count) => {
        setTokenCount(message.id, count, false);
      });
    }
  };

  const handleDelete = () => {
    const state = useAppStore.getState();
    syncOnMessageRemove(state, message.linkedSequenceStepId);
    removeMessage(message.id);
  };

  let borderClass: string;
  if (isSelected) {
    borderClass = 'ring-2 ring-blue-400 border-blue-400 bg-blue-400/10';
  } else if (isFocused) {
    borderClass = 'ring-2 ring-purple-400 border-purple-400 bg-purple-400/10';
  } else if (isHighlighted) {
    borderClass = 'border-blue-400 bg-blue-400/10';
  } else {
    borderClass = 'border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 hover:border-[var(--border-secondary)]';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border transition-colors cursor-pointer ${borderClass}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)] touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <Badge label={config.shortLabel} color={config.color} />
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">
          {message.content || <span className="italic text-[var(--text-muted)]">{config.label}</span>}
        </span>
        <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
          {message.tokenCount}t
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3">
          <textarea
            ref={textRef}
            value={message.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={`Enter ${config.label.toLowerCase()} content...`}
            className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md p-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-y min-h-[60px] focus:outline-none focus:border-[var(--border-secondary)]"
            rows={3}
          />
          {message.type === 'tool_call' && (
            <input
              type="text"
              value={message.metadata?.toolName ?? ''}
              onChange={(e) =>
                updateMessage(message.id, {
                  metadata: { ...message.metadata, toolName: e.target.value },
                })
              }
              onClick={(e) => e.stopPropagation()}
              placeholder="Tool name..."
              className="mt-2 w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-secondary)]"
            />
          )}
        </div>
      )}
    </div>
  );
}
