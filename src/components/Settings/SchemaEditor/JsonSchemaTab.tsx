import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function JsonSchemaTab({ value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (v.trim()) {
      try {
        JSON.parse(v);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    } else {
      setError(null);
    }
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}'
        rows={3}
        className={`w-full bg-[var(--surface-secondary)] border rounded px-2 py-1.5 text-xs text-[var(--text-primary)] resize-y font-mono ${
          error ? 'border-red-500' : 'border-[var(--border-primary)]'
        }`}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
