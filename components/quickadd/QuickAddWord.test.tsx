import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickAddWord } from './QuickAddWord';
import { useWordsStore } from '@/lib/storage/wordsStore';

describe('QuickAddWord', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [{ id: 'w1', english: 'chair', translation: 'стул', category: 'home', tags: [], dateAdded: '2026-09-25', review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: '2026-09-25', correctCount: 0, mistakeCount: 0 } }], hydrated: true });
  });

  it('adds a new word to «Мои слова» by default, ready for review', () => {
    render(<QuickAddWord />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить слово' }));
    fireEvent.change(screen.getByLabelText('Слово по-английски'), { target: { value: '  window ' } });
    fireEvent.change(screen.getByLabelText('Перевод'), { target: { value: 'окно' } });
    fireEvent.change(screen.getByLabelText('Пример (необязательно)'), { target: { value: 'Open the window.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    const added = useWordsStore.getState().items.find((w) => w.english === 'window')!;
    expect(added).toMatchObject({ translation: 'окно', category: 'my-words', example: 'Open the window.' });
    expect(added.review.status).toBe('new');
    expect(screen.getByText('✅ «window» добавлено')).toBeInTheDocument();
  });

  it('can put the word into an existing topic', () => {
    render(<QuickAddWord />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить слово' }));
    fireEvent.change(screen.getByLabelText('Слово по-английски'), { target: { value: 'lamp shade' } });
    fireEvent.change(screen.getByLabelText('Перевод'), { target: { value: 'абажур' } });
    fireEvent.change(screen.getByLabelText('Тема'), { target: { value: 'home' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(useWordsStore.getState().items.find((w) => w.english === 'lamp shade')?.category).toBe('home');
  });

  it('warns about a word that is already there instead of duplicating it', () => {
    render(<QuickAddWord />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить слово' }));
    fireEvent.change(screen.getByLabelText('Слово по-английски'), { target: { value: 'Chair' } });
    fireEvent.change(screen.getByLabelText('Перевод'), { target: { value: 'стул' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByText('Это слово уже есть: chair — стул')).toBeInTheDocument();
    expect(useWordsStore.getState().items).toHaveLength(1);
  });

  it('needs both the word and the translation', () => {
    render(<QuickAddWord />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить слово' }));
    fireEvent.change(screen.getByLabelText('Слово по-английски'), { target: { value: 'door' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByText('Впишите слово и перевод.')).toBeInTheDocument();
  });
});
