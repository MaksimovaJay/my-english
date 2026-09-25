import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopicsPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';

describe('TopicsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    mergeSeed();
  });

  it('shows class and extra groups with topic cards', () => {
    render(<TopicsPage />);
    expect(screen.getByRole('heading', { name: 'Пройдено на уроках' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Новое / не изученное' })).toBeInTheDocument();
    expect(screen.getByText('Дом и квартира')).toBeInTheDocument();
    expect(screen.getByText('Дни недели')).toBeInTheDocument();
  });
});
