import { create } from 'zustand';
import { toISODate, addDays } from '@/lib/learning/date';
import { localStorageAdapter } from './localStorageAdapter';
import { emitDocChange, registerCollection } from '@/lib/sync/changes';

export type Theme = 'light' | 'dark' | 'system';

/** Today's progress towards the daily plan; reset when the date changes. */
export interface DailyProgress {
  date: string;
  reviewed: number; // flashcards answered
  gameCorrect: number; // right answers in games / practice modes
  dueAtStart: number | null; // cards due when the day's plan was first shown
}

interface SettingsRecord {
  id: 'singleton';
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
  bests?: Record<string, number>;
  daily?: DailyProgress | null;
}

interface SettingsData {
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
  bests: Record<string, number>;
  daily: DailyProgress | null;
}

interface SettingsState extends SettingsData {
  hydrated: boolean;
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  recordActivity: (today?: Date) => void;
  /** Saves a score if it beats the best; returns true for a new record. */
  setBest: (game: string, score: number) => boolean;
  /** Adds to today's plan progress (starting a fresh day if needed). */
  bumpDaily: (field: 'reviewed' | 'gameCorrect', today?: Date) => void;
  setDueAtStart: (due: number, today?: Date) => void;
}

function toData(record: SettingsRecord | undefined): Partial<SettingsData> {
  if (!record) return {};
  return {
    theme: record.theme,
    streak: record.streak,
    lastActiveDate: record.lastActiveDate,
    bests: record.bests ?? {},
    daily: record.daily ?? null,
  };
}

function persist(data: SettingsData) {
  const record: SettingsRecord = { id: 'singleton', ...data };
  localStorageAdapter.set<SettingsRecord>('settings', record);
  emitDocChange({ collection: 'settings', id: record.id, item: record });
}

function todaysDaily(daily: DailyProgress | null, today: Date): DailyProgress {
  const date = toISODate(today);
  return daily?.date === date ? daily : { date, reviewed: 0, gameCorrect: 0, dueAtStart: null };
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const data = (): SettingsData => {
    const { theme, streak, lastActiveDate, bests, daily } = get();
    return { theme, streak, lastActiveDate, bests, daily };
  };
  const update = (patch: Partial<SettingsData>) => {
    set(patch);
    persist(data());
  };

  return {
    theme: 'system',
    streak: 0,
    lastActiveDate: null,
    bests: {},
    daily: null,
    hydrated: false,
    hydrate: () => {
      set({ ...toData(localStorageAdapter.get<SettingsRecord>('settings', 'singleton')), hydrated: true });
    },
    setTheme: (theme) => update({ theme }),
    recordActivity: (today = new Date()) => {
      const todayStr = toISODate(today);
      const { lastActiveDate, streak } = get();
      if (lastActiveDate === todayStr) return;
      const yesterday = toISODate(addDays(today, -1));
      update({ streak: lastActiveDate === yesterday ? streak + 1 : 1, lastActiveDate: todayStr });
    },
    setBest: (game, score) => {
      if (score <= (get().bests[game] ?? 0)) return false;
      update({ bests: { ...get().bests, [game]: score } });
      return true;
    },
    bumpDaily: (field, today = new Date()) => {
      const daily = todaysDaily(get().daily, today);
      update({ daily: { ...daily, [field]: daily[field] + 1 } });
    },
    setDueAtStart: (due, today = new Date()) => {
      const daily = todaysDaily(get().daily, today);
      if (daily.dueAtStart !== null) return;
      update({ daily: { ...daily, dueAtStart: due } });
    },
  };
});

registerCollection('settings', {
  list: () => {
    const { theme, streak, lastActiveDate, bests, daily } = useSettingsStore.getState();
    return [{ id: 'singleton', theme, streak, lastActiveDate, bests, daily }];
  },
  replaceAll: (items) => {
    const record = items.find((i) => i.id === 'singleton') as SettingsRecord | undefined;
    if (!record) return;
    localStorageAdapter.replaceAll('settings', [record]);
    useSettingsStore.setState({ ...toData(record), hydrated: true });
  },
});
