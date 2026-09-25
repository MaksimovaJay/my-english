import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TypingPractice } from './TypingPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

const itemsMulti = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'father', translation: 'папа', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('TypingPractice', () => {
  it('shows the translation and checks a correct typed answer', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/напишите по-английски/i), { target: { value: 'mother' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText(/верно/i)).toBeInTheDocument();
  });

  it('shows the correct word after an incorrect attempt', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    fireEvent.change(screen.getByLabelText(/напишите по-английски/i), { target: { value: 'mothar' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText(/неверно/i)).toBeInTheDocument();
    expect(screen.getByText('mother')).toBeInTheDocument();
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

  it('shows a Next word button only after checking, and it starts a fresh round', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/напишите по-английски/i), { target: { value: 'mother' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByText(/верно/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /следующее слово/i }));
    expect((screen.getByLabelText(/напишите по-английски/i) as HTMLInputElement).value).toBe('');
    expect(screen.queryByText(/верно!/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();
  });
});
