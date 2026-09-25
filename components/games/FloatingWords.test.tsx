import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingWords } from './FloatingWords';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'table', translation: 'стол', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('FloatingWords', () => {
  it('shows a target prompt and a bubble for every pool word', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    expect(screen.getByText(/найди слово:/i)).toBeInTheDocument();
    items.forEach((item) => {
      expect(screen.getByRole('button', { name: new RegExp(item.english) })).toBeInTheDocument();
    });
  });

  it('shows Correct when the bubble matching the target translation is clicked', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    const heading = screen.getByText(/найди слово:/i).textContent!;
    const targetItem = items.find((i) => heading.toUpperCase().includes(i.translation.toUpperCase()))!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(targetItem.english) }));
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it('shows Try again when a non-target bubble is clicked', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    const heading = screen.getByText(/найди слово:/i).textContent!;
    const wrongItem = items.find((i) => !heading.toUpperCase().includes(i.translation.toUpperCase()))!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(wrongItem.english) }));
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });
});
