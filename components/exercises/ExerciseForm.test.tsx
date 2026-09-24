import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseForm } from './ExerciseForm';

describe('ExerciseForm', () => {
  it('submits a fill-blank exercise with one accepted-answers blank', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Fill the gap.' } });
    fireEvent.change(screen.getByLabelText(/sentence/i), { target: { value: 'The book is ___ the table.' } });
    fireEvent.change(screen.getByLabelText(/accepted answers/i), { target: { value: 'on, on top of' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const ex = onSubmit.mock.calls[0][0];
    expect(ex.type).toBe('fill-blank');
    expect(ex.items).toEqual([{ text: 'The book is ___ the table.', blanks: [['on', 'on top of']] }]);
  });

  it('submits a multiple-choice exercise', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /multiple choice/i }));
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Choose the right form.' } });
    fireEvent.change(screen.getByLabelText(/^question/i), { target: { value: 'She ___ from Kyrgyzstan.' } });
    fireEvent.change(screen.getByLabelText(/options/i), { target: { value: 'am, is, are' } });
    fireEvent.change(screen.getByLabelText(/correct option index/i), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    const ex = onSubmit.mock.calls[0][0];
    expect(ex.type).toBe('multiple-choice');
    expect(ex.items).toEqual([{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 }]);
  });

  it('rejects a fill-blank sentence without ___', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Fill the gap.' } });
    fireEvent.change(screen.getByLabelText(/sentence/i), { target: { value: 'No blank here.' } });
    fireEvent.change(screen.getByLabelText(/accepted answers/i), { target: { value: 'on' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
