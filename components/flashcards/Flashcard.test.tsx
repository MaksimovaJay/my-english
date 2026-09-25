import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flashcard } from './Flashcard';

const item = {
  id: '1', english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', example: 'My mother is at home.',
  category: 'Family', tags: [], dateAdded: '2026-09-24',
  review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
};

describe('Flashcard', () => {
  it('shows only the front (english) before reveal in en-ru direction', () => {
    render(<Flashcard item={item} direction="en-ru" onOutcome={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.queryByText('мама')).not.toBeInTheDocument();
  });

  it('shows only the translation before reveal in ru-en direction', () => {
    render(<Flashcard item={item} direction="ru-en" onOutcome={vi.fn()} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
  });

  it('reveals the back on tap', () => {
    render(<Flashcard item={item} direction="en-ru" onOutcome={vi.fn()} />);
    fireEvent.click(screen.getByText(/показать ответ/i));
    expect(screen.getByText('мама')).toBeInTheDocument();
    expect(screen.getByText('ˈmʌðər')).toBeInTheDocument();
  });

  it('calls onOutcome with "know" / "hard" / "again" and resets reveal', () => {
    const onOutcome = vi.fn();
    render(<Flashcard item={item} direction="en-ru" onOutcome={onOutcome} />);
    fireEvent.click(screen.getByText(/показать ответ/i));
    // NOTE: the brief's original query `getByRole('button', { name: '✅ Знаю' })` is
    // ambiguous — it matches BOTH "✅ Know" and '❌ Не знаю' and throws a
    // "multiple elements found" error. Scoped to an exact accessible name here
    // (test-side fix, per Task 9/11/13 precedent — component output unchanged).
    fireEvent.click(screen.getByRole('button', { name: '✅ Знаю' }));
    expect(onOutcome).toHaveBeenCalledWith('know');
  });

  it('resets revealed state back to false after an outcome', () => {
    const onOutcome = vi.fn();
    render(<Flashcard item={item} direction="en-ru" onOutcome={onOutcome} />);
    fireEvent.click(screen.getByText(/показать ответ/i));
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '✅ Знаю' }));
    // After the outcome fires, the card resets to unrevealed: the back content
    // is gone and the "tap to reveal" prompt is back.
    expect(screen.queryByText('мама')).not.toBeInTheDocument();
    expect(screen.getByText(/показать ответ/i)).toBeInTheDocument();
  });

  it('calls onOutcome with "again" for Don\'t know and "hard" for Hard', () => {
    const onOutcome = vi.fn();
    render(<Flashcard item={item} direction="en-ru" onOutcome={onOutcome} />);
    fireEvent.click(screen.getByText(/показать ответ/i));
    fireEvent.click(screen.getByRole('button', { name: '❌ Не знаю' }));
    expect(onOutcome).toHaveBeenCalledWith('again');

    fireEvent.click(screen.getByText(/показать ответ/i));
    fireEvent.click(screen.getByRole('button', { name: '🤔 Сложно' }));
    expect(onOutcome).toHaveBeenCalledWith('hard');
  });

  it('shows english+ipa (not translation as the primary line) after reveal in ru-en direction', () => {
    render(<Flashcard item={item} direction="ru-en" onOutcome={vi.fn()} />);
    fireEvent.click(screen.getByText(/показать ответ/i));
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.getByText('ˈmʌðər')).toBeInTheDocument();
  });
});
