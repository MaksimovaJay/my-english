import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';

function reviewState(overrides: Partial<{ status: 'new' | 'learning' | 'review' | 'known'; correctCount: number; mistakeCount: number }>) {
  return { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ProgressPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'known', correctCount: 4, mistakeCount: 1 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'new' }) },
      ],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 6, lastActiveDate: '2026-09-24', hydrated: true });
  });

  it('shows vocabulary counts, accuracy and streak', () => {
    render(<ProgressPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/🔥 6 days/)).toBeInTheDocument();
  });

  it('exports data without throwing', () => {
    // @ts-expect-error test stub
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    // @ts-expect-error test stub
    URL.revokeObjectURL = vi.fn();
    render(<ProgressPage />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: /export json/i }))).not.toThrow();
  });

  it('imports vocabulary from a JSON export file', async () => {
    render(<ProgressPage />);
    const file = new File(
      [JSON.stringify({
        version: 1,
        words: [{ id: 'w9', english: 'dog', translation: 'собака', category: 'Other', tags: [], dateAdded: '2026-09-24', review: reviewState({}) }],
        phrases: [], grammarTopics: [], exercises: [], homeworks: [],
      })],
      'export.json',
      { type: 'application/json' }
    );
    const inputs = document.querySelectorAll('input[type="file"]');
    await userEvent.upload(inputs[0] as HTMLInputElement, file);
    expect(useWordsStore.getState().items.some((w) => w.id === 'w9')).toBe(true);
  });

  it('imports vocabulary from a CSV file', async () => {
    render(<ProgressPage />);
    const csv = 'english,translation,ipa,ruPronunciation,example,category\ncat,кот,kæt,кэт,I have a cat.,Other';
    const file = new File([csv], 'vocab.csv', { type: 'text/csv' });
    const inputs = document.querySelectorAll('input[type="file"]');
    await userEvent.upload(inputs[1] as HTMLInputElement, file);
    expect(useWordsStore.getState().items.some((w) => w.english === 'cat')).toBe(true);
  });
});
