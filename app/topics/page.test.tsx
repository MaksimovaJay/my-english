import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopicsPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';
import { useTopicsStore } from '@/lib/storage/topicsStore';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

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

describe('TopicsPage new topic', () => {
  it('creates a topic and opens it', () => {
    render(<TopicsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Новая тема/ }));
    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Работа' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    const created = useTopicsStore.getState().items.find((d) => d.title === 'Работа')!;
    expect(created).toMatchObject({ custom: true, group: 'class', emoji: '📁' });
    expect(push).toHaveBeenCalledWith(`/topics/${created.id}`);
    expect(screen.getByText('Работа')).toBeInTheDocument();
  });
});
