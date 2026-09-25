import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GamesPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { mergeSeed } from '@/lib/seed/mergeSeed';

describe('GamesPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    mergeSeed();
  });

  it('offers both games and a word-set selector', () => {
    render(<GamesPage />);
    expect(screen.getByRole('button', { name: /Найди пару/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Лови слова/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Слова для игры')).toHaveValue('all');
  });

  it('switches to Floating Words and narrows words to a topic', () => {
    render(<GamesPage />);
    fireEvent.change(screen.getByLabelText('Слова для игры'), { target: { value: 'days' } });
    fireEvent.click(screen.getByRole('button', { name: /Лови слова/ }));
    expect(screen.getByText(/найди слово:/i)).toBeInTheDocument();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const bubbles = screen.getAllByRole('button', { name: /🫧/ }).filter((b) => !b.textContent?.includes('Лови слова'));
    expect(bubbles.length).toBeGreaterThan(0);
    bubbles.forEach((b) => {
      expect(days.some((d) => b.textContent?.includes(d))).toBe(true);
    });
  });
});

describe('GamesPage new round', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    mergeSeed();
  });

  it('offers a new matching round', () => {
    render(<GamesPage />);
    expect(screen.getByRole('button', { name: 'Новый раунд' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Новый раунд' }));
    expect(screen.getByLabelText('Слова для игры')).toHaveValue('all');
  });
});
