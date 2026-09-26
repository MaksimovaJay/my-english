import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpeakPractice } from './SpeakPractice';
import { AUTO_ADVANCE_MS } from './useAutoAdvance';
import { createInitialReviewState } from '@/lib/learning/review';

const items = [{ id: '1', english: 'kitchen', translation: 'кухня', category: 'home', tags: [], dateAdded: '2026-09-26', review: createInitialReviewState() }];

describe('SpeakPractice', () => {
  afterEach(() => vi.useRealTimers());

  it('accepts the right word and moves on by itself', async () => {
    vi.useFakeTimers();
    render(<SpeakPractice items={items} random={() => 0} supported recognizer={async () => ['Kitchen']} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сказать' })));
    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(screen.getByText('Нажмите на микрофон и скажите по-английски')).toBeInTheDocument();
  });

  it('shows what was heard and lets you try again or skip', async () => {
    render(<SpeakPractice items={items} random={() => 0} supported recognizer={async () => ['chicken']} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сказать' })));
    expect(screen.getByText('❌ Попробуйте ещё раз')).toBeInTheDocument();
    expect(screen.getByText('Распознано: «chicken»')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Пропустить →' })).toBeInTheDocument();
  });

  it('explains a blocked microphone', async () => {
    render(<SpeakPractice items={items} random={() => 0} supported recognizer={async () => { throw new Error('not-allowed'); }} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сказать' })));
    expect(screen.getByText(/Разрешите доступ к микрофону/)).toBeInTheDocument();
  });

  it('says so when the browser cannot recognize speech', () => {
    render(<SpeakPractice items={items} supported={false} />);
    expect(screen.getByText(/не умеет распознавать речь/)).toBeInTheDocument();
  });
});
