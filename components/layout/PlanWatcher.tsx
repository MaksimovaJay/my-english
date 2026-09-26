'use client';

import { useEffect } from 'react';
import { usePlan } from '@/components/home/usePlan';
import { isPlanDone } from '@/lib/learning/plan';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { useSyncStatus } from '@/lib/sync/syncStatus';

/**
 * Runs on every page: fixes today's card goal once, and when the plan is complete records the day
 * (streak + lastActiveDate, which the evening reminder checks). Waits for the first sync so a stale
 * cache never writes over newer progress from another device.
 */
export function PlanWatcher() {
  const { tasks, dueNow, today } = usePlan();
  const hydrated = useWordsStore((s) => s.hydrated && s.items.length > 0);
  const syncing = useSyncStatus((s) => s.status === 'syncing');

  useEffect(() => {
    if (!hydrated || syncing) return;
    const { daily, setDueAtStart, recordActivity } = useSettingsStore.getState();
    if (daily?.date !== today || daily.dueAtStart === null) setDueAtStart(dueNow);
    if (isPlanDone(tasks)) recordActivity();
  }, [hydrated, syncing, tasks, dueNow, today]);

  return null;
}
