import { useCallback, useRef, useState } from 'react';
import { Play, Square, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function RunAgentButton() {
  const agentStatus = useAppStore((s) => s.agentStatus);
  const setAgentStatus = useAppStore((s) => s.setAgentStatus);
  const apiKey = useAppStore((s) => s.connectorSettings.apiKey);
  const messages = useAppStore((s) => s.messages);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const lastMessageIsUser = messages.length > 0 && messages[messages.length - 1].type === 'user_message';

  const handleRun = useCallback(async () => {
    if (!apiKey) {
      alert('Configure an API key first (LLM button)');
      return;
    }

    // If last message is already a user message, run directly without new input
    if (lastMessageIsUser) {
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
      return;
    }

    if (!userInput.trim()) {
      setShowInput(true);
      return;
    }

    setAgentStatus('running');
    abortRef.current = new AbortController();

    try {
      const { runAgent } = await import('../../services/langchain-agent');
      await runAgent(userInput, abortRef.current.signal);
      setAgentStatus('idle');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setAgentStatus('idle');
      } else {
        setAgentStatus('error', (err as Error).message);
      }
    }
    setShowInput(false);
    setUserInput('');
  }, [apiKey, userInput, setAgentStatus, lastMessageIsUser]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  if (agentStatus === 'running') {
    return (
      <button
        onClick={handleAbort}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-900/50 border border-red-700 hover:border-red-500 transition-colors text-xs text-red-300"
      >
        <Square size={12} />
        Stop
      </button>
    );
  }

  if (agentStatus === 'paused') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-900/50 border border-amber-700 text-xs text-amber-300">
        <Loader2 size={12} className="animate-spin" />
        Paused (waiting for input)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {showInput && !lastMessageIsUser && (
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="Enter prompt..."
          className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] w-48"
          autoFocus
        />
      )}
      <button
        onClick={handleRun}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-900/50 border border-green-700 hover:border-green-500 transition-colors text-xs text-green-300"
      >
        <Play size={12} />
        Run
      </button>
    </div>
  );
}
