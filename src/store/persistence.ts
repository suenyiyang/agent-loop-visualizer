import { useAppStore } from './useAppStore';
import {
  createSnapshot,
  validateSnapshot,
  downloadJson,
  type AppSnapshot,
} from '../utils/serialization';

export function exportState() {
  const state = useAppStore.getState();
  const snapshot = createSnapshot(
    state.messages,
    state.tokenLimit,
    state.actors,
    state.steps,
    state.groups,
    {
      systemPromptTemplates: state.systemPromptTemplates,
      toolDefinitions: state.toolDefinitions,
      connectorSettings: {
        baseUrl: state.connectorSettings.baseUrl,
        modelId: state.connectorSettings.modelId,
      },
    },
  );
  downloadJson(snapshot, `agent-loop-${new Date().toISOString().slice(0, 10)}.json`);
}

export function importState(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!validateSnapshot(data)) {
          reject(new Error('Invalid snapshot format'));
          return;
        }
        const snapshot = data as AppSnapshot;
        const store = useAppStore.getState();
        store.setMessages(snapshot.contextWindow.messages);
        store.setTokenLimit(snapshot.contextWindow.tokenLimit);
        store.setActors(snapshot.sequenceDiagram.actors);
        store.setSteps(snapshot.sequenceDiagram.steps);
        store.setGroups(snapshot.sequenceDiagram.groups);

        if (snapshot.settings) {
          store.setSystemPromptTemplates(snapshot.settings.systemPromptTemplates);
          useAppStore.setState({ toolDefinitions: snapshot.settings.toolDefinitions });
          store.setConnectorSettings(snapshot.settings.connectorSettings);
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
