// components/vocabulary/VocabForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabForm } from './VocabForm';

describe('VocabForm', () => {
  it('requires english, translation and category before submitting', () => {
    const onSubmit = vi.fn();
    render(<VocabForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('submits a new item with the entered values', () => {
    const onSubmit = vi.fn();
    render(<VocabForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByLabelText(/translation/i), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.english).toBe('dog');
    expect(submitted.translation).toBe('собака');
    expect(submitted.category).toBe('Other');
    expect(submitted.id).toBeTruthy();
  });

  it('pre-fills fields when editing an existing item', () => {
    const existing = {
      id: 'w1', english: 'cat', translation: 'кот', category: 'Other', tags: [], dateAdded: '2026-09-24',
      review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
    };
    render(<VocabForm initial={existing} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/english/i)).toHaveValue('cat');
    expect(screen.getByLabelText(/translation/i)).toHaveValue('кот');
  });
});
