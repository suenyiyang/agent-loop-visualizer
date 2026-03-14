import { encode } from 'gpt-tokenizer';

export function countTokens(text: string): number {
  if (!text) return 0;
  return encode(text).length;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function countTokensDebounced(
  text: string,
  callback: (count: number) => void,
  delay = 300,
) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    callback(countTokens(text));
  }, delay);
}
