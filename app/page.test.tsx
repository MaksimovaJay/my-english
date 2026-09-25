import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { initHomeworkProgress } from '@/lib/learning/homework';
import { toISODate } from '@/lib/learning/date';

describe('HomePage', () => {
  beforeEach(() => {
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [{
        id: '1', english: 'chair', translation: 'стул', category: 'home', tags: [], dateAdded: toISODate(new Date()),
        review: { status: 'review', level: 1, lastReviewed: null, nextReviewDate: '2020-01-01', correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 3, lastActiveDate: '2026-09-24', hydrated: true });
    const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'x', items: [{ text: 'a ___ b', blanks: [['x']] }] }];
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('shows greeting, due count, streak, start button and homework link', () => {
    render(<HomePage />);
    expect(screen.getByText(/(Доброе утро|Добрый день|Добрый вечер), MJay/)).toBeInTheDocument();
    expect(screen.getByText('📚 1 слово на повторение')).toBeInTheDocument();
    expect(screen.getByText('🔥 3 дня подряд')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'НАЧАТЬ ПОВТОРЕНИЕ' })).toHaveAttribute('href', '/review');
    expect(screen.getByRole('link', { name: /Unit 11/ })).toHaveAttribute('href', '/homework/hw1');
  });

  it('lists topics with material added this week', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'Новое на этой неделе' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Дом и квартира/ })).toHaveAttribute('href', '/topics/home');
  });
});
