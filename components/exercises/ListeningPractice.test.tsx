import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders 3 option buttons and marks the correct choice', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    const buttons = screen.getAllByRole('button', { name: /^(mother|father|chair|table)$/i });
    expect(buttons).toHaveLength(3);
    // Compute the actual target deterministically with the same pool/random the
    // component uses, rather than assuming a fixed item — buildListeningRound
    // reorders the pool internally, so the target is not always items[0].
    const round = buildListeningRound(items, () => 0)!;
    fireEvent.click(buttons.find((b) => b.textContent === round.target.english)!);
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('marks an incorrect choice in red and shows the incorrect message', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    const buttons = screen.getAllByRole('button', { name: /^(mother|father|chair|table)$/i });
    const round = buildListeningRound(items, () => 0)!;
    const wrongButton = buttons.find((b) => b.textContent !== round.target.english)!;
    fireEvent.click(wrongButton);
    expect(screen.getByText('❌ Неверно')).toBeInTheDocument();
    expect(wrongButton.className).toMatch(/border-red-500/);
  });

  it('does not color any option before a selection is made', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    const buttons = screen.getAllByRole('button', { name: /^(mother|father|chair|table)$/i });
    buttons.forEach((b) => {
      expect(b.className).not.toMatch(/border-green-500|border-red-500/);
    });
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    expect(screen.queryByText('❌ Неверно')).not.toBeInTheDocument();
  });

  it('shows a Next word button only after a selection, and it starts a fresh round', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /^(mother|father|chair|table)$/i });
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('button', { name: /следующее слово/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /следующее слово/i }));
    expect(screen.queryByText('✅ Верно!')).not.toBeInTheDocument();
    expect(screen.queryByText('❌ Неверно')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /следующее слово/i })).not.toBeInTheDocument();
  });
});
