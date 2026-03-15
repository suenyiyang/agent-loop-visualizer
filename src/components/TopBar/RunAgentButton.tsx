import { useCallback, useRef } from 'react';
import { Play, Square, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function RunAgentButton() {
  const agentStatus = useAppStore((s) => s.agentStatus);
  const setAgentStatus = useAppStore((s) => s.setAgentStatus);
  const apiKey = useAppStore((s) => s.connectorSettings.apiKey);
  const messages = useAppStore((s) => s.messages);
  const abortRef = useRef<AbortController | null>(null);

  const isEmpty = messages.length === 0;

  const handleRun = useCallback(async () => {
    if (!apiKey) {
      alert('Configure an API key first (LLM button)');
      return;
    }

    setAgentStatus('running');
    abortRef.current = new AbortController();
    try {
      const { runAgent } = await import('../../services/langchain-agent');
      await runAgent(null, abortRef.current.signal);
      setAgentStatus('idle');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setAgentStatus('idle');
      } else {
        setAgentStatus('error', (err as Error).message);
      }
    }
  }, [apiKey, setAgentStatus]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  if (agentStatus === 'running') {
    return (
      <button
        onClick={handleAbort}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 border border-red-300 hover:border-red-500 transition-colors text-xs text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:hover:border-red-500 dark:text-red-300"
      >
        <Square size={12} />
        Stop
      </button>
    );
  }

  if (agentStatus === 'paused') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 border border-amber-300 text-xs text-amber-700 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300">
        <Loader2 size={12} className="animate-spin" />
        Paused (waiting for input)
      </span>
    );
  }

  return (
    <button
      onClick={handleRun}
      disabled={isEmpty}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors text-xs ${
        isEmpty
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
          : 'bg-green-100 border-green-300 hover:border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-700 dark:hover:border-green-500 dark:text-green-300'
      }`}
    >
      <Play size={12} />
      Run
    </button>
  );
}
