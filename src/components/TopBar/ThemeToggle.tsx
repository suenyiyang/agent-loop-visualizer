import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ThemeMode } from '../../store/slices/theme-slice';

const CYCLE: ThemeMode[] = ['system', 'dark', 'light'];

const ICONS: Record<ThemeMode, typeof Monitor> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
};

const LABELS: Record<ThemeMode, string> = {
  system: 'System theme',
  dark: 'Dark theme',
  light: 'Light theme',
};

export function ThemeToggle() {
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const next = () => {
    const idx = CYCLE.indexOf(themeMode);
    setThemeMode(CYCLE[(idx + 1) % CYCLE.length]);
  };

  const Icon = ICONS[themeMode];

  return (
    <button
      onClick={next}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors text-xs text-[var(--text-secondary)]"
      title={LABELS[themeMode]}
    >
      <Icon size={14} />
    </button>
  );
}
