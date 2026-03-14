import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

function ConnectorFields() {
  const [showKey, setShowKey] = useState(false);
  const settings = useAppStore((s) => s.connectorSettings);
  const setSettings = useAppStore((s) => s.setConnectorSettings);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-[var(--text-tertiary)] block mb-1">Base URL</label>
        <input
          type="text"
          value={settings.baseUrl}
          onChange={(e) => setSettings({ baseUrl: e.target.value })}
          className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-tertiary)] block mb-1">API Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => setSettings({ apiKey: e.target.value })}
            className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)] pr-8"
            placeholder="sk-..."
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-[var(--text-tertiary)] block mb-1">Model</label>
        <input
          type="text"
          value={settings.modelId}
          onChange={(e) => setSettings({ modelId: e.target.value })}
          className="w-full bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>
    </div>
  );
}

export function ConnectorSettingsInline() {
  return <ConnectorFields />;
}
