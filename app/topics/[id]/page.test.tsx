import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopicPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';
import { useTopicsStore } from '@/lib/storage/topicsStore';

const params = { id: 'home' };
const push = vi.fn();
vi.mock('next/navigation', () => ({ useParams: () => params, useRouter: () => ({ push }) }));

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

describe('TopicPage editing', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    mergeSeed();
    params.id = 'home';
  });

  it('edits a word, keeps its progress and protects it from seed updates', () => {
    const before = useWordsStore.getState().items.find((w) => w.id === 'seed-word-sofa')!;
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить sofa' }));
    fireEvent.change(screen.getByLabelText('Перевод'), { target: { value: 'диван, софа' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    const after = useWordsStore.getState().items.find((w) => w.id === 'seed-word-sofa')!;
    expect(after).toMatchObject({ translation: 'диван, софа', edited: true, review: before.review });
    expect(screen.getByText('диван, софа')).toBeInTheDocument();
  });

  it('moves a word to another topic', () => {
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить sofa' }));
    fireEvent.change(screen.getByLabelText('Тема'), { target: { value: 'my-words' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.queryByText('sofa')).not.toBeInTheDocument();
    expect(useWordsStore.getState().items.find((w) => w.id === 'seed-word-sofa')?.category).toBe('my-words');
  });

  it('deletes a word after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить sofa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(useWordsStore.getState().items.some((w) => w.id === 'seed-word-sofa')).toBe(false);
  });
});

describe('TopicPage topic editing', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    useTopicsStore.setState({ items: [], hydrated: true });
    mergeSeed();
    params.id = 'home';
  });

  it('renames a topic and changes its icon', () => {
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить тему' }));
    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Моя квартира' } });
    fireEvent.change(screen.getByLabelText('Значок'), { target: { value: '🛋️' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByRole('heading', { name: '🛋️ Моя квартира' })).toBeInTheDocument();
    expect(useTopicsStore.getState().items).toEqual([{ id: 'home', title: 'Моя квартира', emoji: '🛋️', group: 'class' }]);
  });

  it('deletes a topic and moves its words to «Мои слова»', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const count = useWordsStore.getState().items.filter((w) => w.category === 'home').length;
    render(<TopicPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить тему' }));
    fireEvent.click(screen.getByRole('button', { name: 'Удалить тему' }));
    expect(useTopicsStore.getState().items).toEqual([{ id: 'home', hidden: true }]);
    expect(useWordsStore.getState().items.filter((w) => w.category === 'my-words')).toHaveLength(count);
    expect(push).toHaveBeenCalledWith('/topics');
  });
});
