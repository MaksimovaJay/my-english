'use client';

import { useMemo } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { getDueItems } from '@/lib/learning/reviewQueue';
import { buildPlan, PlanTask } from '@/lib/learning/plan';
import { toISODate } from '@/lib/learning/date';

export function usePlan(): { tasks: PlanTask[]; dueNow: number; today: string } {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const homeworks = useHomeworkStore((s) => s.items);
  const daily = useSettingsStore((s) => s.daily);
  const today = toISODate(new Date());
  const dueNow = useMemo(() => getDueItems([...words, ...phrases]).length, [words, phrases]);
  const tasks = useMemo(() => buildPlan({ daily, dueNow, homeworks, today }), [daily, dueNow, homeworks, today]);
  return { tasks, dueNow, today };
}
