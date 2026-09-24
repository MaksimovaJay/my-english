import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardDeck } from './FlashcardDeck';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('FlashcardDeck', () => {
  it('advances to the next card and updates the item after an outcome', () => {
    const onUpdateItem = vi.fn();
    render(<FlashcardDeck items={items} onUpdateItem={onUpdateItem} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/tap to reveal/i));
    // NOTE: the brief's original query `getByRole('button', { name: /know/i })` is
    // ambiguous — it matches both "✅ Know" and "❌ Don't know" and throws.
    // Scoped to the exact accessible name (test-side fix, per Task 9/11/13 precedent).
    fireEvent.click(screen.getByRole('button', { name: '✅ Know' }));
    expect(onUpdateItem).toHaveBeenCalledTimes(1);
    expect(onUpdateItem.mock.calls[0][0].id).toBe('1');
    expect(screen.getByText('chair')).toBeInTheDocument();
  });

  it('merges the updated review state (via updateReviewState) into the emitted item', () => {
    const onUpdateItem = vi.fn();
    render(<FlashcardDeck items={items} onUpdateItem={onUpdateItem} />);
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: '✅ Know' }));
    const updated = onUpdateItem.mock.calls[0][0];
    expect(updated.id).toBe('1');
    expect(updated.english).toBe('mother');
    // updateReviewState bumps level on a "know" outcome from a new (level 0) card.
    expect(updated.review.level).toBe(1);
    expect(updated.review.correctCount).toBe(1);
  });

  it('toggles direction between EN->RU and RU->EN', () => {
    render(<FlashcardDeck items={items} onUpdateItem={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    // NOTE: the brief's original query `getByRole('button', { name: /ru.*en/i })`
    // never matches: the toggle buttons render flag emoji (🇬🇧/🇷🇺), which are
    // pictographic Unicode codepoints, not the literal characters "r"/"u"/"e"/"n" —
    // so the regex can't find literal "ru"/"en" text in either button's accessible
    // name and the query throws "unable to find element". Fixed on the test side
    // by querying the RU->EN toggle via its flag content instead of Latin-letter text.
    fireEvent.click(screen.getByRole('button', { name: /🇷🇺.*🇬🇧/ }));
    expect(screen.getByText('мама')).toBeInTheDocument();
  });

  it('direction toggle switches ALL cards, not just the current one', () => {
    render(<FlashcardDeck items={items} onUpdateItem={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /🇷🇺.*🇬🇧/ }));
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: '✅ Know' }));
    // Second card should now also render in ru-en direction (translation first).
    expect(screen.getByText('стул')).toBeInTheDocument();
    expect(screen.queryByText('chair')).not.toBeInTheDocument();
  });

  it('shows a completion message once every card is done', () => {
    render(<FlashcardDeck items={[items[0]]} onUpdateItem={vi.fn()} />);
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: '✅ Know' }));
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });
});
