import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

describe('HomePage', () => {
  beforeEach(() => {
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [{
        id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
        review: { status: 'review', level: 1, lastReviewed: null, nextReviewDate: '2020-01-01', correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 3, lastActiveDate: '2026-09-24', hydrated: true });
    const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'x', items: [{ text: 'a ___ b', blanks: [['x']] }] }];
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('shows a greeting, due count, streak, and a continue-learning link', () => {
    render(<HomePage />);
    expect(screen.getByText(/good (morning|afternoon|evening), mjay/i)).toBeInTheDocument();
    expect(screen.getByText(/1 words to review/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥 3 day streak/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Unit 11' })).toHaveAttribute('href', '/homework/hw1');
    expect(screen.getByRole('link', { name: /start learning/i })).toHaveAttribute('href', '/review');
  });
});
