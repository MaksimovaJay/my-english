import { create } from 'zustand';
import { toISODate, addDays } from '@/lib/learning/date';
import { localStorageAdapter } from './localStorageAdapter';
import { emitDocChange, registerCollection } from '@/lib/sync/changes';

export type Theme = 'light' | 'dark' | 'system';

interface SettingsRecord {
  id: 'singleton';
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
}

interface SettingsState {
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  recordActivity: (today?: Date) => void;
}

function persist(state: Pick<SettingsState, 'theme' | 'streak' | 'lastActiveDate'>) {
  const record: SettingsRecord = { id: 'singleton', ...state };
  localStorageAdapter.set<SettingsRecord>('settings', record);
  emitDocChange({ collection: 'settings', id: record.id, item: record });
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  streak: 0,
  lastActiveDate: null,
  hydrated: false,
  hydrate: () => {
    const record = localStorageAdapter.get<SettingsRecord>('settings', 'singleton');
    if (record) set({ theme: record.theme, streak: record.streak, lastActiveDate: record.lastActiveDate, hydrated: true });
    else set({ hydrated: true });
  },
  setTheme: (theme) => {
    set({ theme });
    persist({ theme, streak: get().streak, lastActiveDate: get().lastActiveDate });
  },
  recordActivity: (today = new Date()) => {
    const todayStr = toISODate(today);
    const { lastActiveDate, streak, theme } = get();
    if (lastActiveDate === todayStr) return;
    const yesterday = toISODate(addDays(today, -1));
    const newStreak = lastActiveDate === yesterday ? streak + 1 : 1;
    set({ streak: newStreak, lastActiveDate: todayStr });
    persist({ theme, streak: newStreak, lastActiveDate: todayStr });
  },
}));

registerCollection('settings', {
  list: () => {
    const { theme, streak, lastActiveDate } = useSettingsStore.getState();
    return [{ id: 'singleton', theme, streak, lastActiveDate }];
  },
  replaceAll: (items) => {
    const record = items.find((i) => i.id === 'singleton') as SettingsRecord | undefined;
    if (!record) return;
    localStorageAdapter.replaceAll('settings', [record]);
    useSettingsStore.setState({ theme: record.theme, streak: record.streak, lastActiveDate: record.lastActiveDate, hydrated: true });
  },
});
