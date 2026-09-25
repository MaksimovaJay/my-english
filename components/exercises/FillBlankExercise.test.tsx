import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FillBlankExercise, blankWidthCh } from './FillBlankExercise';

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
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(onCheck).toHaveBeenCalledWith(0);
  });

  it('does not throw and marks a missing blanks entry as incorrect', () => {
    const malformedItems = [{ text: 'Last year she ___ 22, so she ___ 23 now.', blanks: [['was']] }];
    expect(() =>
      render(
        <FillBlankExercise
          items={malformedItems}
          userAnswers={[['was', 'is']]}
          checked={[true]}
          onAnswerChange={vi.fn()}
          onCheck={vi.fn()}
        />
      )
    ).not.toThrow();
    expect(screen.getByLabelText('blank-0-0')).toHaveClass('border-green-500');
    expect(screen.getByLabelText('blank-0-1')).toHaveClass('border-red-500');
  });
});

describe('blankWidthCh', () => {
  it('fits the longest accepted answer, with a minimum for short words', () => {
    expect(blankWidthCh(['was'])).toBe(8);
    expect(blankWidthCh(['Where were Sue and Chris last week?'])).toBe(38);
  });
});

describe('FillBlankExercise Enter key', () => {
  it('checks the item on Enter', () => {
    const onCheck = vi.fn();
    render(<FillBlankExercise items={[{ text: 'She ___ 22.', blanks: [['was']] }]} userAnswers={[['was']]} checked={[false]} onAnswerChange={vi.fn()} onCheck={onCheck} />);
    fireEvent.keyDown(screen.getByLabelText('blank-0-0'), { key: 'Enter' });
    expect(onCheck).toHaveBeenCalledWith(0);
  });
});
