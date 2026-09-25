import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StoreHydrator } from './StoreHydrator';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { toISODate } from '@/lib/learning/date';

describe('StoreHydrator', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, hydrated: false });
  });

  it('records activity for today on mount', () => {
    render(<StoreHydrator />);
    expect(useSettingsStore.getState().lastActiveDate).toBe(toISODate(new Date()));
    expect(useSettingsStore.getState().streak).toBeGreaterThanOrEqual(1);
  });
});
