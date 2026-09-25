import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingGame } from './MatchingGame';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'table', translation: 'стол', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('MatchingGame', () => {
  it('marks every correct pair matched and shows completion', () => {
    render(<MatchingGame items={items} count={3} random={() => 0} />);
    for (const item of items) {
      fireEvent.click(screen.getByRole('button', { name: item.english }));
      fireEvent.click(screen.getByRole('button', { name: item.translation }));
    }
    expect(screen.getByText('3 / 3 верно 🎉')).toBeInTheDocument();
  });

  it('does not mark a wrong pair as matched', () => {
    render(<MatchingGame items={items} count={3} random={() => 0} />);
    fireEvent.click(screen.getByRole('button', { name: 'mother' }));
    fireEvent.click(screen.getByRole('button', { name: 'стул' }));
    expect(screen.queryByText(/верно 🎉/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'mother' })).not.toBeDisabled();
  });
});
