// components/layout/ThemeToggle.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useSettingsStore } from '@/lib/storage/settingsStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: 'light', streak: 0, lastActiveDate: null, hydrated: true });
  });

  it('shows the current theme and toggles to dark on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(button);
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('toggles back to light from dark', () => {
    useSettingsStore.setState({ theme: 'dark' });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme/i }));
    expect(useSettingsStore.getState().theme).toBe('light');
  });
});
