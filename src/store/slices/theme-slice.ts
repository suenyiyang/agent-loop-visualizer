import type { StateCreator } from 'zustand';

export type ThemeMode = 'system' | 'dark' | 'light';

export interface ThemeSlice {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set) => ({
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),
});
