import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useTheme() {
  const themeMode = useAppStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;

    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (themeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('dark', 'light');
    }
  }, [themeMode]);
}
