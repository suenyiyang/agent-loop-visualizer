import { useEffect, useState } from 'react';
import { parseZodToJsonSchema } from '../../../utils/zod-schema-parser';
import type { ToolDefinition } from '../../../types/settings';

interface Props {
  zodCode: string;
  onUpdate: (updates: Partial<Omit<ToolDefinition, 'id'>>) => void;
}

export function ZodCodeTab({ zodCode, onUpdate }: Props) {
  const [code, setCode] = useState(zodCode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setCode(zodCode); }, [zodCode]);

  const handleParse = () => {
    if (!code.trim()) {
      setError('Enter a Zod expression');
      return;
    }

    const result = parseZodToJsonSchema(code);
    if (result.error) {
      setError(result.error);
      setSuccess(false);
    } else {
      setError(null);
      setSuccess(true);
      onUpdate({ zodCode: code, parametersJson: result.jsonSchema });
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => { setCode(e.target.value); setError(null); setSuccess(false); }}
        onBlur={handleParse}
        placeholder="z.object({ query: z.string().describe('Search query') })"
        rows={3}
        className={`w-full bg-[var(--surface-secondary)] border rounded px-2 py-1.5 text-xs text-[var(--text-primary)] resize-y font-mono ${
          error ? 'border-red-500' : success ? 'border-green-500' : 'border-[var(--border-primary)]'
        }`}
      />
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleParse}
          className="px-2 py-0.5 text-xs bg-blue-600/30 border border-blue-600 rounded text-blue-300 hover:border-blue-400 transition-colors"
        >
          Parse
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
        {success && <span className="text-xs text-green-400">Parsed successfully</span>}
      </div>
    </div>
  );
}
