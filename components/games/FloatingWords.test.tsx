import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AUTO_ADVANCE_MS } from '@/components/exercises/useAutoAdvance';
import { FloatingWords } from './FloatingWords';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'table', translation: 'стол', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('FloatingWords', () => {
  it('shows a target prompt and a bubble for every pool word', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    expect(screen.getByText(/найди слово:/i)).toBeInTheDocument();
    items.forEach((item) => {
      expect(screen.getByRole('button', { name: new RegExp(item.english) })).toBeInTheDocument();
    });
  });

  afterEach(() => vi.useRealTimers());

  const targetOf = () => {
    const prompt = screen.getByText(/найди слово:/i).textContent ?? '';
    return items.find((i) => prompt.includes(i.translation.toUpperCase()))!;
  };

  it('asks to try again on a wrong bubble and stays on the word', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    const prompt = screen.getByText(/найди слово:/i).textContent;
    const target = targetOf();
    const wrong = items.find((i) => i.id !== target.id && screen.queryByRole('button', { name: new RegExp(i.english) }))!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(wrong.english) }));
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    expect(screen.getByText(/найди слово:/i).textContent).toBe(prompt);
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();
  });

  it('goes to the next word by itself after the right bubble', () => {
    vi.useFakeTimers();
    render(<FloatingWords items={items} random={() => 0} />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(targetOf().english) }));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
  });
});
