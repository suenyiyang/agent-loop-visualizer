import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useTokenCounter() {
  const messages = useAppStore((s) => s.messages);
  const tokenLimit = useAppStore((s) => s.tokenLimit);

  const totalTokens = useMemo(
    () => messages.reduce((sum, m) => sum + m.tokenCount, 0),
    [messages],
  );

  const usagePercent = tokenLimit > 0 ? (totalTokens / tokenLimit) * 100 : 0;

  const tokensByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of messages) {
      map[m.type] = (map[m.type] ?? 0) + m.tokenCount;
    }
    return map;
  }, [messages]);

  return { totalTokens, tokenLimit, usagePercent, tokensByType };
}
