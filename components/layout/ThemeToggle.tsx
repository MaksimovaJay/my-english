// components/layout/ThemeToggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Сменить тему"
      className={cn('rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
