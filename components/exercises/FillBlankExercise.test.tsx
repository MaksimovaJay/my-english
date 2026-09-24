import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FillBlankExercise } from './FillBlankExercise';

const items = [{ text: 'She ___ 22 last year.', blanks: [['was']] }];

describe('FillBlankExercise', () => {
  it('reports typed values via onAnswerChange', () => {
    const onAnswerChange = vi.fn();
    render(<FillBlankExercise items={items} userAnswers={[['']]} checked={[false]} onAnswerChange={onAnswerChange} onCheck={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    expect(onAnswerChange).toHaveBeenCalledWith(0, 0, 'was');
  });

  it('colors the blank green when checked and correct', () => {
    render(<FillBlankExercise items={items} userAnswers={[['was']]} checked={[true]} onAnswerChange={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByLabelText('blank-0-0')).toHaveClass('border-green-500');
  });

  it('colors the blank red when checked and incorrect', () => {
    render(<FillBlankExercise items={items} userAnswers={[['were']]} checked={[true]} onAnswerChange={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByLabelText('blank-0-0')).toHaveClass('border-red-500');
  });

  it('calls onCheck with the item index', () => {
    const onCheck = vi.fn();
    render(<FillBlankExercise items={items} userAnswers={[['was']]} checked={[false]} onAnswerChange={vi.fn()} onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onCheck).toHaveBeenCalledWith(0);
  });
});
