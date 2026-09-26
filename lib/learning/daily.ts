import { useSettingsStore } from '@/lib/storage/settingsStore';

/** A right answer in any game or practice mode counts towards today's plan. */
export function recordGameCorrect(): void {
  useSettingsStore.getState().bumpDaily('gameCorrect');
}
