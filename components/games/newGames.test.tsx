import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SentenceBuilder } from './SentenceBuilder';
import { LetterGuess } from './LetterGuess';
import { TimedQuiz, TIMED_SECONDS } from './TimedQuiz';
import { AUTO_ADVANCE_MS } from '@/components/exercises/useAutoAdvance';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { createInitialReviewState } from '@/lib/learning/review';
import { VocabItem } from '@/types/models';

const v = (id: string, english: string, translation: string): VocabItem => ({
  id, english, translation, category: 'x', tags: [], dateAdded: '2026-09-26', review: createInitialReviewState(),
});

beforeEach(() => {
  window.localStorage.clear();
  useSettingsStore.setState({ bests: {}, daily: null });
});
afterEach(() => vi.useRealTimers());

describe('SentenceBuilder', () => {
  const items = [v('p1', 'Why were you late?', 'Почему ты опоздала?')];
  const chip = (text: string) => screen.getAllByRole('button', { name: text }).at(-1)!;

  it('checks the order when all words are placed and moves on when right', () => {
    vi.useFakeTimers();
    render(<SentenceBuilder items={items} random={() => 0} />);
    expect(screen.getByText('Почему ты опоздала?')).toBeInTheDocument();
    for (const w of ['Why', 'were', 'you', 'late']) fireEvent.click(chip(w));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    expect(useSettingsStore.getState().daily?.gameCorrect).toBe(1);
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    expect(screen.getByText('Нажимайте на слова по порядку')).toBeInTheDocument();
  });

  it('lets you take a word back after a wrong order', () => {
    render(<SentenceBuilder items={items} random={() => 0} />);
    for (const w of ['were', 'Why', 'you', 'late']) fireEvent.click(chip(w));
    expect(screen.getByText(/Попробуйте ещё раз/)).toBeInTheDocument();
    const answer = screen.getByLabelText('Ваш ответ');
    fireEvent.click(answer.querySelectorAll('button')[0]); // remove "were"
    expect(screen.queryByText(/Попробуйте ещё раз/)).not.toBeInTheDocument();
  });
});

describe('LetterGuess', () => {
  const items = [v('w', 'sofa', 'диван')];

  it('reveals guessed letters and moves on when the word is solved', () => {
    vi.useFakeTimers();
    render(<LetterGuess items={items} random={() => 0} />);
    expect(screen.getByLabelText('Слово')).toHaveTextContent('_ _ _ _');
    for (const l of ['s', 'o', 'f', 'a']) fireEvent.click(screen.getByRole('button', { name: l }));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.getByLabelText('Слово')).toHaveTextContent('_ _ _ _');
  });

  it('shows the word after six wrong letters', () => {
    render(<LetterGuess items={items} random={() => 0} />);
    for (const l of ['b', 'c', 'd', 'e', 'g', 'h']) fireEvent.click(screen.getByRole('button', { name: l }));
    expect(screen.getByText('sofa')).toBeInTheDocument();
    expect(screen.getByLabelText('Слово')).toHaveTextContent('s o f a');
  });
});

describe('TimedQuiz', () => {
  const items = ['cat', 'dog', 'sun', 'sea', 'sky'].map((e, i) => v(e, e, `ru-${e}-${i}`));

  it('scores right answers for 60 seconds and keeps the record', () => {
    vi.useFakeTimers();
    render(<TimedQuiz items={items} random={() => 0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Старт' }));
    for (let i = 0; i < 3; i++) {
      const word = screen.getByText(/^(cat|dog|sun|sea|sky)$/).textContent!;
      const right = items.find((x) => x.english === word)!.translation;
      fireEvent.click(screen.getByRole('button', { name: right }));
    }
    expect(screen.getByLabelText('Очки')).toHaveTextContent('3');
    act(() => vi.advanceTimersByTime(TIMED_SECONDS * 1000));
    expect(screen.getByText('Время вышло!')).toBeInTheDocument();
    expect(screen.getByText('🏆 Новый рекорд!')).toBeInTheDocument();
    expect(useSettingsStore.getState().bests.timed).toBe(3);
  });
});
