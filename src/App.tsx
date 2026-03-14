import { Routes, Route } from 'react-router';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { TopBar } from './components/TopBar/TopBar';
import { ContextWindowPanel } from './components/ContextWindow/Panel';
import { SequenceDiagramPanel } from './components/SequenceDiagram/Panel';
import { SettingsPage } from './components/Settings/SettingsPage';
import { useTheme } from './hooks/use-theme';
import { useKeyboardDelete } from './hooks/use-keyboard-delete';

function VisualizerLayout() {
  return (
    <Group orientation="horizontal" className="flex-1">
      <Panel defaultSize={40} minSize={25}>
        <ContextWindowPanel />
      </Panel>
      <Separator className="w-1.5 bg-[var(--surface-secondary)] hover:bg-blue-500/40 transition-colors cursor-col-resize" />
      <Panel defaultSize={60} minSize={30}>
        <SequenceDiagramPanel />
      </Panel>
    </Group>
  );
}

export default function App() {
  useTheme();
  const { dialog, confirmDialog, cancelDialog } = useKeyboardDelete();

  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<VisualizerLayout />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={cancelDialog}>
          <div className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{dialog.title}</h3>
            <p className="text-[var(--text-secondary)] mb-6">{dialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDialog}
                className="px-4 py-2 rounded-md bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:opacity-80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
