import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';

function reviewState(overrides: Partial<{ status: 'new' | 'learning' | 'review' | 'known'; correctCount: number; mistakeCount: number }>) {
  return { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ProgressPage', () => {
  beforeEach(() => {
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
});
