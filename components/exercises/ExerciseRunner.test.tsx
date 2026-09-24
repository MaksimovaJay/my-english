import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseRunner } from './ExerciseRunner';

const fillBlankExercise = {
  id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill in was/were.',
  items: [{ text: 'She ___ 22 last year.', blanks: [['was']] }],
};

describe('ExerciseRunner', () => {
  it('shows the instruction and the answer inputs', () => {
    render(<ExerciseRunner exercise={fillBlankExercise} />);
    expect(screen.getByText('Fill in was/were.')).toBeInTheDocument();
    expect(screen.getByLabelText('blank-0-0')).toBeInTheDocument();
  });

  it('calls onComplete with the final score once every item is checked', () => {
    const onComplete = vi.fn();
    render(<ExerciseRunner exercise={fillBlankExercise} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
  });

  it('does not call onComplete again on re-click of already-checked item', () => {
    const onComplete = vi.fn();
    render(<ExerciseRunner exercise={fillBlankExercise} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    // First click: should call onComplete
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
    // Second click: should NOT call onComplete again
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reveals the correct answer on demand', () => {
    render(<ExerciseRunner exercise={fillBlankExercise} />);
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /show correct answer/i }));
    expect(screen.getByText(/correct answer:/i)).toBeInTheDocument();
    expect(screen.getByText('was')).toBeInTheDocument();
  });
});
