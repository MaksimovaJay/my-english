import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AUTO_ADVANCE_MS } from './useAutoAdvance';
import { TypingPractice } from './TypingPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

const itemsMulti = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'father', translation: 'папа', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('TypingPractice', () => {
  afterEach(() => vi.useRealTimers());
  const input = () => screen.getByLabelText(/напишите по-английски/i);

  it('checks with Enter and moves on by itself when correct', () => {
    vi.useFakeTimers();
    render(<TypingPractice items={items} random={() => 0} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.change(input(), { target: { value: 'mother' } });
    fireEvent.submit(input());
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    expect(input()).toHaveValue('');
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();
  });

  it('lets you fix a wrong answer, and shows the answer after the second miss', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    fireEvent.change(input(), { target: { value: 'mothar' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    expect(screen.queryByText(/Правильно:/)).not.toBeInTheDocument();
    expect(input()).toHaveValue('mothar');
    fireEvent.change(input(), { target: { value: 'mathor' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText(/Правильно:/)).toHaveTextContent('Правильно: mother');
    fireEvent.change(input(), { target: { value: 'mother' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('keeps target word unchanged across multiple keystrokes with 2+ item pool', () => {
    // Use a random function that would pick a different item on a second call
    // to verify that useMemo does NOT re-evaluate when input changes
    let callCount = 0;
    const selectiveRandom = () => (callCount++ === 0 ? 0 : 0.99);

    render(<TypingPractice items={itemsMulti} random={selectiveRandom} />);

    // Verify the first item (mother / мама) is selected
    expect(screen.getByText('мама')).toBeInTheDocument();
    const initialTranslation = screen.getByText('мама');

    // Type multiple characters via separate fireEvent.change calls
    // If the memo were buggy and re-evaluated on each keystroke,
    // it could pick item at index Math.floor(0.99 * 2) = 1 (father / папа)
    const input = screen.getByLabelText(/напишите по-английски/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'm' } });
    fireEvent.change(input, { target: { value: 'mo' } });
    fireEvent.change(input, { target: { value: 'mot' } });
    fireEvent.change(input, { target: { value: 'moth' } });

    // The translation should still be мама (not папа)
    expect(screen.getByText('мама')).toBeInTheDocument();
    expect(screen.queryByText('папа')).not.toBeInTheDocument();
  });

});
