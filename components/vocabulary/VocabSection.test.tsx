// components/vocabulary/VocabSection.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabSection } from './VocabSection';
import { useWordsStore } from '@/lib/storage/wordsStore';

describe('VocabSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({
      items: [{
        id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
        review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
  });

  it('shows the table view by default', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    expect(screen.getByText('mother')).toBeInTheDocument();
  });

  it('switches to Flashcards mode', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    fireEvent.click(screen.getByRole('button', { name: /flashcards/i }));
    expect(screen.getByText(/tap to reveal/i)).toBeInTheDocument();
  });

  it('opens the add form and adds a new word to the store', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    fireEvent.click(screen.getByRole('button', { name: /\+ add/i }));
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Translation' }), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(useWordsStore.getState().items).toHaveLength(2);
  });
});
