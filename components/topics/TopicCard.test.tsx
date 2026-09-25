import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicCard } from './TopicCard';
import { TopicContent } from '@/lib/learning/topics';
import { createInitialReviewState } from '@/lib/learning/review';
import { VocabItem } from '@/types/models';

const word = (id: string, status: VocabItem['review']['status']): VocabItem => ({
  id, english: id, translation: id, category: 'home', tags: [], dateAdded: '2026-09-25',
  review: { ...createInitialReviewState(), status },
});

const content: TopicContent = {
  topic: { id: 'home', title: 'Дом и квартира', emoji: '🏠', group: 'class', order: 1 },
  words: [word('chair', 'known'), word('table', 'new')],
  phrases: [],
  grammar: [],
  exerciseCount: 1,
};

describe('TopicCard', () => {
  it('links to the topic and shows counts and progress', () => {
    render(<TopicCard content={content} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/topics/home');
    expect(screen.getByText('Дом и квартира')).toBeInTheDocument();
    expect(screen.getByText('2 слова · 1 упр.')).toBeInTheDocument();
    expect(screen.getByLabelText('Прогресс 50%')).toBeInTheDocument();
  });
});
