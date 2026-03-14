import { useState } from 'react';

interface JsonTreeProps {
  data: unknown;
  highlighted?: boolean;
  depth?: number;
}

export function JsonTree({ data, highlighted, depth = 0 }: JsonTreeProps) {
  if (data === null) {
    return <span className="text-gray-400 italic">null</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-purple-400">{String(data)}</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-blue-400">{data}</span>;
  }

  if (typeof data === 'string') {
    if (data.length > 200 && depth > 0) {
      return <span className="text-green-400">&quot;{data.slice(0, 200)}...&quot;</span>;
    }
    return <span className="text-green-400">&quot;{data}&quot;</span>;
  }

  if (Array.isArray(data)) {
    return <CollapsibleArray data={data} highlighted={highlighted} depth={depth} />;
  }

  if (typeof data === 'object') {
    return <CollapsibleObject data={data as Record<string, unknown>} highlighted={highlighted} depth={depth} />;
  }

  return <span className="text-[var(--text-muted)]">{String(data)}</span>;
}

function CollapsibleObject({ data, highlighted, depth }: { data: Record<string, unknown>; highlighted?: boolean; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const entries = Object.entries(data);

  if (entries.length === 0) return <span className="text-[var(--text-muted)]">{'{}'}</span>;

  const highlightClass = highlighted ? 'bg-purple-500/10 rounded' : '';

  if (!expanded) {
    return (
      <span
        className={`cursor-pointer hover:opacity-80 ${highlightClass}`}
        onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
      >
        <span className="text-[var(--text-muted)]">{'{'}</span>
        <span className="text-[var(--text-tertiary)]">...{entries.length}</span>
        <span className="text-[var(--text-muted)]">{'}'}</span>
      </span>
    );
  }

  return (
    <span className={highlightClass}>
      <span
        className="text-[var(--text-muted)] cursor-pointer hover:opacity-80"
        onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
      >
        {'{'}
      </span>
      <div className="ml-4">
        {entries.map(([key, value], i) => (
          <div key={key}>
            <span className="text-[var(--text-secondary)]">{key}</span>
            <span className="text-[var(--text-muted)]">: </span>
            <JsonTree data={value} depth={depth + 1} />
            {i < entries.length - 1 && <span className="text-[var(--text-muted)]">,</span>}
          </div>
        ))}
      </div>
      <span className="text-[var(--text-muted)]">{'}'}</span>
    </span>
  );
}

function CollapsibleArray({ data, highlighted, depth }: { data: unknown[]; highlighted?: boolean; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (data.length === 0) return <span className="text-[var(--text-muted)]">[]</span>;

  const highlightClass = highlighted ? 'bg-purple-500/10 rounded' : '';

  if (!expanded) {
    return (
      <span
        className={`cursor-pointer hover:opacity-80 ${highlightClass}`}
        onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
      >
        <span className="text-[var(--text-muted)]">[</span>
        <span className="text-[var(--text-tertiary)]">...{data.length}</span>
        <span className="text-[var(--text-muted)]">]</span>
      </span>
    );
  }

  return (
    <span className={highlightClass}>
      <span
        className="text-[var(--text-muted)] cursor-pointer hover:opacity-80"
        onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
      >
        [
      </span>
      <div className="ml-4">
        {data.map((item, i) => (
          <div key={i}>
            <JsonTree data={item} depth={depth + 1} />
            {i < data.length - 1 && <span className="text-[var(--text-muted)]">,</span>}
          </div>
        ))}
      </div>
      <span className="text-[var(--text-muted)]">]</span>
    </span>
  );
}
