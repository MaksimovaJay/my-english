import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';

const items = [{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 }];

describe('MultipleChoiceExercise', () => {
  it('answers on tap — there is no separate check button', () => {
    const onAnswer = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[null]} checked={[false]} onAnswer={onAnswer} />);
    expect(screen.queryByRole('button', { name: /проверить/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'is' }));
    expect(onAnswer).toHaveBeenCalledWith(0, 1);
  });

  it('shows a correct answer in green with «Верно»', () => {
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[true]} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'is' })).toHaveClass('border-green-500', 'dark:bg-green-950/40');
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('shows a wrong answer in red and invites another try', () => {
    const onAnswer = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[0]} checked={[true]} onAnswer={onAnswer} />);
    expect(screen.getByRole('button', { name: 'am' })).toHaveClass('border-red-500', 'dark:bg-red-950/40');
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'is' }));
    expect(onAnswer).toHaveBeenCalledWith(0, 1);
  });

  it('locks the item once answered correctly', () => {
    const onAnswer = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[true]} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: 'am' }));
    expect(onAnswer).not.toHaveBeenCalled();
  });
});
