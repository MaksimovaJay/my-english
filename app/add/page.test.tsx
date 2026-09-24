import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';

describe('AddPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
  });

  it('adds a word to the words store by default', () => {
    render(<AddPage />);
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByLabelText('Translation', { exact: true }), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(useWordsStore.getState().items).toHaveLength(1);
    expect(usePhrasesStore.getState().items).toHaveLength(0);
  });

  it('adds to the phrases store when Phrase type is selected', () => {
    render(<AddPage />);
    fireEvent.click(screen.getByRole('button', { name: /^phrase$/i }));
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'How are you?' } });
    fireEvent.change(screen.getByLabelText('Translation', { exact: true }), { target: { value: 'Как дела?' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Phrases' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(usePhrasesStore.getState().items).toHaveLength(1);
    expect(useWordsStore.getState().items).toHaveLength(0);
  });
});
