import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StoreHydrator } from './StoreHydrator';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';

describe('StoreHydrator', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: false });
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, hydrated: false });
  });

  it('loads the stores and the lesson material on mount', () => {
    render(<StoreHydrator />);
    expect(useWordsStore.getState().hydrated).toBe(true);
    expect(useWordsStore.getState().items.length).toBeGreaterThan(0);
  });

  it('does not count the day just for opening the app (the daily plan does that)', () => {
    render(<StoreHydrator />);
    expect(useSettingsStore.getState().lastActiveDate).toBeNull();
  });
});
