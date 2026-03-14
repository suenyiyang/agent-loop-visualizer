import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportState, importState } from '../../store/persistence';

export function ExportImportButtons() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importState(file);
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={exportState}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
        title="Export as JSON"
      >
        <Download size={12} />
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
        title="Import JSON"
      >
        <Upload size={12} />
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
