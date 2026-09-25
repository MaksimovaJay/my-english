// components/layout/StoreHydrator.tsx
'use client';

import { useEffect } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { loadSeedIfEmpty } from '@/lib/seed/loadSeedIfEmpty';

export function StoreHydrator() {
  useEffect(() => {
    useWordsStore.getState().hydrate();
    usePhrasesStore.getState().hydrate();
    useGrammarStore.getState().hydrate();
    useExercisesStore.getState().hydrate();
    useHomeworkStore.getState().hydrate();
    useSettingsStore.getState().hydrate();
    loadSeedIfEmpty();
    useSettingsStore.getState().recordActivity();
  }, []);

  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  return null;
}
