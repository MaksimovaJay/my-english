import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import { WordBankExercise } from './WordBankExercise';
import { WordBankGame } from '@/components/games/WordBankGame';
import { AUTO_ADVANCE_MS } from './useAutoAdvance';
import { createInitialReviewState } from '@/lib/learning/review';
import { FillBlankItem, VocabItem } from '@/types/models';

const items: FillBlankItem[] = [
  { text: 'The streets were ___ in NY.', blanks: [['noisy']] },
  { text: 'The kids in the room ___ quiet.', blanks: [['were']] },
];

function Harness() {
  const [answers, setAnswers] = useState<string[][]>([[''], ['']]);
  return <WordBankExercise items={items} bank={['were', 'fast', 'noisy']} answers={answers} onChange={(i, a) => setAnswers((p) => p.map((x, j) => (j === i ? a : x)))} />;
}

const bankButton = (name: string) => screen.getAllByRole('button', { name }).find((b) => b.closest('[aria-label="Слова"]'))!;

describe('WordBankExercise (homework)', () => {
  it('fills the first empty blank with the tapped word and checks the sentence', () => {
    render(<Harness />);
    fireEvent.click(bankButton('fast'));
    expect(screen.getByText('❌ Попробуйте ещё раз — нажмите на слово, чтобы убрать его')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Пропуск 1' })[0]); // take «fast» back
    fireEvent.click(bankButton('noisy'));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('puts the word into the blank you chose', () => {
    render(<Harness />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Пропуск 1' })[1]); // second sentence
    fireEvent.click(bankButton('were'));
    expect(screen.getByLabelText('Предложение 2')).toHaveTextContent('were');
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });
});

describe('WordBankGame', () => {
  afterEach(() => vi.useRealTimers());
  const v = (id: string, english: string, example?: string): VocabItem => ({
    id, english, translation: id, category: 'x', tags: [], dateAdded: '2026-10-01', example, review: createInitialReviewState(),
  });

  it('moves on by itself after the right word, asks to retry after a wrong one', () => {
    vi.useFakeTimers();
    render(<WordBankGame items={[v('t', 'table', 'The book is on the table.'), v('b', 'bed'), v('l', 'lamp')]} random={() => 0} />);
    fireEvent.click(bankButton('bed'));
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    fireEvent.click(bankButton('table'));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
  });
});
