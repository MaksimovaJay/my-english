import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';

const items = [{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 }];

describe('MultipleChoiceExercise', () => {
  it('reports the selected option via onSelect', () => {
    const onSelect = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[null]} checked={[false]} onSelect={onSelect} onCheck={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'is' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });

  it('highlights the selected correct option green once checked', () => {
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[true]} onSelect={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'is' })).toHaveClass('bg-green-50');
  });

  it('highlights a wrong selection red once checked', () => {
    render(<MultipleChoiceExercise items={items} selected={[0]} checked={[true]} onSelect={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'am' })).toHaveClass('bg-red-50');
  });

  it('calls onCheck with the item index', () => {
    const onCheck = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[false]} onSelect={vi.fn()} onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(onCheck).toHaveBeenCalledWith(0);
  });
});
