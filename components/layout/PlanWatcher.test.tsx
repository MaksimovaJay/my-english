import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PlanWatcher } from './PlanWatcher';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { useSyncStatus } from '@/lib/sync/syncStatus';
import { toISODate } from '@/lib/learning/date';

const today = toISODate(new Date());
const due = { status: 'review' as const, level: 1, lastReviewed: null, nextReviewDate: '2020-01-01', correctCount: 0, mistakeCount: 0 };

describe('PlanWatcher', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [{ id: '1', english: 'a', translation: 'а', category: 'x', tags: [], dateAdded: today, review: due }], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useHomeworkStore.setState({ items: [], hydrated: true });
    useSyncStatus.setState({ status: 'ok', pending: 0 });
  });

  it('fixes today\'s card goal and does not count the day before the plan is done', () => {
    useSettingsStore.setState({ streak: 2, lastActiveDate: null, daily: null });
    render(<PlanWatcher />);
    expect(useSettingsStore.getState().daily).toMatchObject({ date: today, dueAtStart: 1 });
    expect(useSettingsStore.getState().lastActiveDate).toBeNull();
  });

  it('counts the day once the plan is complete', () => {
    useSettingsStore.setState({ streak: 0, lastActiveDate: null, daily: { date: today, reviewed: 1, gameCorrect: 10, dueAtStart: 1 } });
    render(<PlanWatcher />);
    expect(useSettingsStore.getState().lastActiveDate).toBe(today);
    expect(useSettingsStore.getState().streak).toBe(1);
  });

  it('waits while the first sync is running', () => {
    useSyncStatus.setState({ status: 'syncing', pending: 0 });
    useSettingsStore.setState({ lastActiveDate: null, daily: null });
    render(<PlanWatcher />);
    expect(useSettingsStore.getState().daily).toBeNull();
  });
});
