import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabCardList } from './VocabCardList';
import { createInitialReviewState } from '@/lib/learning/review';

const items = [
  { id: 'w1', english: 'chair', translation: 'стул', ruPronunciation: 'чэа', example: 'There is a chair.', exampleTranslation: 'Есть стул.', category: 'home', tags: [], dateAdded: '2026-09-25', review: createInitialReviewState() },
  { id: 'w2', english: 'sofa', translation: 'диван', category: 'home', tags: [], dateAdded: '2026-09-25', review: createInitialReviewState() },
];

describe('VocabCardList', () => {
  it('shows word, pronunciation, translation and example', () => {
    render(<VocabCardList items={items} />);
    expect(screen.getByText('chair')).toBeInTheDocument();
    expect(screen.getByText('[чэа]')).toBeInTheDocument();
    expect(screen.getByText('стул')).toBeInTheDocument();
    expect(screen.getByText('There is a chair.')).toBeInTheDocument();
  });

  it('hides translations and reveals one on click', () => {
    render(<VocabCardList items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть перевод' }));
    expect(screen.queryByText('стул')).not.toBeInTheDocument();
    expect(screen.queryByText('диван')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('chair'));
    expect(screen.getByText('стул')).toBeInTheDocument();
    expect(screen.queryByText('диван')).not.toBeInTheDocument();
  });
});
