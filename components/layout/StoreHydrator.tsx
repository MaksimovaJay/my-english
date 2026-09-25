// components/layout/StoreHydrator.tsx
'use client';

import { useEffect } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';
import { createSyncEngine } from '@/lib/sync/syncEngine';
import { supabaseRemote } from '@/lib/sync/remote';

export function StoreHydrator() {
  useEffect(() => {
    useWordsStore.getState().hydrate();
    usePhrasesStore.getState().hydrate();
    useGrammarStore.getState().hydrate();
    useExercisesStore.getState().hydrate();
    useHomeworkStore.getState().hydrate();
    useSettingsStore.getState().hydrate();

    // Tests never talk to Supabase.
    if (process.env.NODE_ENV === 'test') {
      mergeSeed();
      useSettingsStore.getState().recordActivity();
      return;
    }

    const hadLocalData = useWordsStore.getState().items.length > 0;
    const engine = createSyncEngine({ remote: supabaseRemote });
    let active = true;
    void engine.start().then(({ pulled }) => {
      if (!active) return;
      // Seed only on top of the server's data: seeding a stale cache and pushing it could overwrite real progress.
      if (pulled) mergeSeed();
      if (pulled || hadLocalData) useSettingsStore.getState().recordActivity();
    });
    return () => {
      active = false;
      engine.stop();
    };
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
