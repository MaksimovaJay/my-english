import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TypingPractice } from './TypingPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('TypingPractice', () => {
  it('shows the translation and checks a correct typed answer', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'mother' } });
    fireEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it('shows the correct word after an incorrect attempt', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'mothar' } });
    fireEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    expect(screen.getByText('mother')).toBeInTheDocument();
  });
});
