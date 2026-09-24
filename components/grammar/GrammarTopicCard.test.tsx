import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrammarTopicCard } from './GrammarTopicCard';

const topic = {
  id: 'g1', title: 'There is / There are', explanation: 'There is — единственное число.',
  examples: ['There is a chair in the room.'],
  practiceExercises: [{ id: 'ex1', type: 'multiple-choice' as const, instruction: 'Choose the right option.', items: [{ question: '___ a sofa.', options: ['There is', 'There are'], correctIndex: 0 }] }],
  dateAdded: '2026-09-24',
};

describe('GrammarTopicCard', () => {
  it('renders title, explanation, examples and embedded practice', () => {
    render(<GrammarTopicCard topic={topic} />);
    expect(screen.getByText('There is / There are')).toBeInTheDocument();
    expect(screen.getByText('There is — единственное число.')).toBeInTheDocument();
    expect(screen.getByText('There is a chair in the room.')).toBeInTheDocument();
    expect(screen.getByText('Choose the right option.')).toBeInTheDocument();
  });
});
