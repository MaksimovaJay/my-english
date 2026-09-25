import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopicPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';

const params = { id: 'home' };
vi.mock('next/navigation', () => ({ useParams: () => params }));

describe('TopicPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    mergeSeed();
  });

  it('shows only the tabs that have content', () => {
    params.id = 'home';
    render(<TopicPage />);
    expect(screen.getByRole('heading', { name: /Дом и квартира/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Слова/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Правило/ })).not.toBeInTheDocument();
    expect(screen.getByText('sofa')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Тренировать' })).toBeInTheDocument();
  });

  it('shows the book exercises of a grammar topic', () => {
    params.id = 'was-were';
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('tab', { name: /Упражнения/ }));
    expect(screen.getByText(/11\.2 Заполните пропуски/)).toBeInTheDocument();
  });

  it('reports an unknown topic', () => {
    params.id = 'nope';
    render(<TopicPage />);
    expect(screen.getByText('Тема не найдена.')).toBeInTheDocument();
  });
});
