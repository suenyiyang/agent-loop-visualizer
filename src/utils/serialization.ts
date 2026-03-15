import type { ContextMessage } from '../types/context';
import type { Actor, SequenceStep, ActorGroup } from '../types/sequence';
import type { ToolDefinition, SystemPromptTemplate } from '../types/settings';
import type { ConsoleEntry } from '../store/slices/console-slice';

export interface SnapshotSettings {
  systemPromptTemplates: SystemPromptTemplate[];
  toolDefinitions: ToolDefinition[];
  connectorSettings: { baseUrl: string; modelId: string };
}

export interface AppSnapshot {
  version: 1;
  exportedAt: string;
  contextWindow: { messages: ContextMessage[]; tokenLimit: number };
  sequenceDiagram: { actors: Actor[]; steps: SequenceStep[]; groups: ActorGroup[] };
  settings?: SnapshotSettings;
  console?: { entries: ConsoleEntry[] };
}

export function createSnapshot(
  messages: ContextMessage[],
  tokenLimit: number,
  actors: Actor[],
  steps: SequenceStep[],
  groups: ActorGroup[],
  settings?: SnapshotSettings,
  consoleEntries?: ConsoleEntry[],
): AppSnapshot {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    contextWindow: { messages, tokenLimit },
    sequenceDiagram: { actors, steps, groups },
    ...(settings && { settings }),
    ...(consoleEntries && consoleEntries.length > 0 && { console: { entries: consoleEntries } }),
  };
}

export function validateSnapshot(data: unknown): data is AppSnapshot {
  if (!data || typeof data !== 'object') return false;
  const s = data as Record<string, unknown>;
  return (
    s.version === 1 &&
    typeof s.exportedAt === 'string' &&
    s.contextWindow != null &&
    s.sequenceDiagram != null
  );
}

export function downloadJson(snapshot: AppSnapshot, filename: string) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
