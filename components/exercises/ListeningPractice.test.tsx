import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AUTO_ADVANCE_MS } from './useAutoAdvance';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ListeningPractice } from './ListeningPractice';
import { buildListeningRound } from '@/lib/learning/listeningPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'father', translation: 'папа', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('ListeningPractice', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  afterEach(() => vi.useRealTimers());

  const round = () => buildListeningRound(items, () => 0)!;
  const optionButtons = () => screen.getAllByRole('button').filter((b) => items.some((i) => i.english === b.textContent));

  it('renders 3 options and no result before answering', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    expect(optionButtons()).toHaveLength(3);
    optionButtons().forEach((b) => expect(b.className).not.toMatch(/border-green-500|border-red-500/));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();
  });

  it('on a wrong choice marks it red and lets you try again on the same word', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    const wrong = optionButtons().find((b) => b.textContent !== round().target.english)!;
    fireEvent.click(wrong);
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    expect(wrong.className).toMatch(/border-red-500/);
    fireEvent.click(optionButtons().find((b) => b.textContent === round().target.english)!);
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('moves to the next word by itself after a correct choice', () => {
    vi.useFakeTimers();
    render(<ListeningPractice items={items} random={() => 0} />);
    fireEvent.click(optionButtons().find((b) => b.textContent === round().target.english)!);
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    optionButtons().forEach((b) => expect(b.className).not.toMatch(/border-green-500/));
  });
});
