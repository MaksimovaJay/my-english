import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';

function reviewState(overrides: Partial<{ nextReviewDate: string | null; mistakeCount: number }>) {
  return { status: 'review' as const, level: 1, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ReviewPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2020-01-01', mistakeCount: 3 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2099-01-01', mistakeCount: 0 }) },
      ],
      hydrated: true,
    });
  });

  it('shows only due items on the Due today tab and finishes after answering the one due card', () => {
    render(<ReviewPage />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/показать ответ/i));
    // NOTE: the brief's original query `getByRole('button', { name: '✅ Знаю' })` is
    // ambiguous — it matches BOTH "✅ Know" and '❌ Не знаю' and throws a
    // "Found multiple elements" error (same bug documented in Task 14's Flashcard tests).
    fireEvent.click(screen.getByRole('button', { name: '✅ Знаю' }));
    expect(screen.getByText(/на сегодня всё/i)).toBeInTheDocument();
  });

  it('shows only items with mistakes on the Practice my mistakes tab', () => {
    render(<ReviewPage />);
    fireEvent.click(screen.getByRole('button', { name: /мои ошибки/i }));
    expect(screen.getByText('mother')).toBeInTheDocument();
  });

  it('still shows the first mistake card after progressing partway through Due today, not an immediate Done', () => {
    // Two due items: 'mother' has a mistake, 'chair' does not, so the mistakes queue
    // (length 1) is shorter than the due queue (length 2). Answering the first due
    // card advances FlashcardDeck's internal index to 1; without a remount key, that
    // stale index (1) would be >= the mistakes queue's length (1) and incorrectly
    // render "Done for now!" instead of the one mistake card.
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2020-01-01', mistakeCount: 3 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2020-01-01', mistakeCount: 0 }) },
      ],
      hydrated: true,
    });
    render(<ReviewPage />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/показать ответ/i));
    fireEvent.click(screen.getByRole('button', { name: '✅ Знаю' }));
    expect(screen.getByText('chair')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /мои ошибки/i }));
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.queryByText(/на сегодня всё/i)).not.toBeInTheDocument();
  });
});

describe('ReviewPage homework mistakes', () => {
  it('lists homework items answered wrong under «Мои ошибки»', () => {
    useHomeworkStore.setState({
      items: [{
        id: 'h1', number: 1, title: 'Unit 11', assignedDate: '2026-09-25', status: 'completed',
        exercises: [{ id: 'e', type: 'fill-blank', instruction: '11.2', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }],
        progress: { e: { userAnswers: [['is']], checked: [true], correct: [false] } },
      }],
      hydrated: true,
    });
    render(<ReviewPage />);
    expect(screen.queryByRole('heading', { name: '📝 Из домашки' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /мои ошибки/i }));
    expect(screen.getByRole('heading', { name: '📝 Из домашки' })).toBeInTheDocument();
    expect(screen.getByText('ДЗ 1 · 11.2')).toBeInTheDocument();
  });
});
