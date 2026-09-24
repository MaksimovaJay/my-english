import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GrammarTopicForm } from './GrammarTopicForm';

describe('GrammarTopicForm', () => {
  it('requires title and explanation', () => {
    const onSubmit = vi.fn();
    render(<GrammarTopicForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a topic with examples split by line', () => {
    const onSubmit = vi.fn();
    render(<GrammarTopicForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: 'Present Simple' } });
    fireEvent.change(screen.getByLabelText(/explanation/i), { target: { value: 'Used for habits.' } });
    fireEvent.change(screen.getByLabelText(/examples/i), { target: { value: 'I work every day.\nShe works every day.' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.title).toBe('Present Simple');
    expect(submitted.examples).toEqual(['I work every day.', 'She works every day.']);
    expect(submitted.practiceExercises).toEqual([]);
  });
});
