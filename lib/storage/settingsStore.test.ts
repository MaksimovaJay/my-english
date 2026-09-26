import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, hydrated: false });
  });

  it('defaults to system theme', () => {
    expect(useSettingsStore.getState().theme).toBe('system');
  });

  it('setTheme persists and updates state', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('recordActivity starts a streak at 1 on first activity', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
    expect(useSettingsStore.getState().lastActiveDate).toBe('2026-09-24');
  });

  it('recordActivity increments streak on the following day', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-25T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(2);
  });

  it('recordActivity resets streak to 1 after a gap', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-27T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
  });

  it('recordActivity is idempotent within the same day', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T12:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
  });
});

describe('useSettingsStore bests and daily progress', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, bests: {}, daily: null, hydrated: false });
  });

  it('keeps only a better score as the record', () => {
    expect(useSettingsStore.getState().setBest('timed', 12)).toBe(true);
    expect(useSettingsStore.getState().setBest('timed', 9)).toBe(false);
    expect(useSettingsStore.getState().bests.timed).toBe(12);
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().bests.timed).toBe(12);
  });

  it('counts today and starts over on a new day', () => {
    const day1 = new Date('2026-09-26T10:00:00');
    useSettingsStore.getState().bumpDaily('gameCorrect', day1);
    useSettingsStore.getState().bumpDaily('gameCorrect', day1);
    useSettingsStore.getState().setDueAtStart(7, day1);
    useSettingsStore.getState().setDueAtStart(3, day1); // only the first one of the day counts
    expect(useSettingsStore.getState().daily).toEqual({ date: '2026-09-26', reviewed: 0, gameCorrect: 2, dueAtStart: 7 });
    useSettingsStore.getState().bumpDaily('reviewed', new Date('2026-09-27T09:00:00'));
    expect(useSettingsStore.getState().daily).toEqual({ date: '2026-09-27', reviewed: 1, gameCorrect: 0, dueAtStart: null });
  });
});
