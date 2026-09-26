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

const today = toISODate(new Date());

describe('HomePage', () => {
  beforeEach(() => {
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [{
        id: '1', english: 'chair', translation: 'стул', category: 'home', tags: [], dateAdded: today,
        example: 'There is a chair.', exampleTranslation: 'Есть стул.',
        review: { status: 'review', level: 1, lastReviewed: null, nextReviewDate: '2020-01-01', correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 3, lastActiveDate: '2026-09-24', bests: {}, daily: { date: today, reviewed: 0, gameCorrect: 4, dueAtStart: 1 }, hydrated: true });
    const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'x', items: [{ text: 'a ___ b', blanks: [['x']] }] }];
    useHomeworkStore.setState({
      items: [{ id: 'hw1', number: 2, title: 'Unit 12', assignedDate: today, status: 'in-progress', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('greets and shows today\'s plan with a start button to the first unfinished task', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /(Доброе утро|Добрый день|Добрый вечер), MJay/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '📋 План на сегодня' })).toBeInTheDocument();
    expect(screen.getByText('🔥 3 дня')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Повторить карточки/ })).toHaveTextContent('0 / 1');
    expect(screen.getByRole('link', { name: /Правильные ответы в играх/ })).toHaveTextContent('4 / 10');
    expect(screen.getByRole('link', { name: /Домашка: Unit 12/ })).toHaveAttribute('href', '/homework/hw1');
    expect(screen.getByRole('link', { name: 'НАЧАТЬ' })).toHaveAttribute('href', '/review');
  });

  it('shows the word of the day and topics with new material', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: '✨ Слово дня' })).toBeInTheDocument();
    expect(screen.getAllByText('chair').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Новое на этой неделе' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Дом и квартира/ })).toHaveAttribute('href', '/topics/home');
  });

  it('celebrates a completed plan', () => {
    useHomeworkStore.setState({ items: [], hydrated: true });
    useSettingsStore.setState({ daily: { date: today, reviewed: 1, gameCorrect: 10, dueAtStart: 1 } });
    render(<HomePage />);
    expect(screen.getByText('🎉 План выполнен! Увидимся завтра')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'НАЧАТЬ' })).not.toBeInTheDocument();
  });
});
