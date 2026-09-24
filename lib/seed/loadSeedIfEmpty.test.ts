import { describe, it, expect, beforeEach } from 'vitest';
import { loadSeedIfEmpty } from './loadSeedIfEmpty';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';

describe('loadSeedIfEmpty', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: false });
    usePhrasesStore.setState({ items: [], hydrated: false });
    useGrammarStore.setState({ items: [], hydrated: false });
  });

  it('populates all three stores when empty', () => {
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items.length).toBeGreaterThan(0);
    expect(usePhrasesStore.getState().items.length).toBeGreaterThan(0);
    expect(useGrammarStore.getState().items.length).toBeGreaterThan(0);
  });

  it('does not duplicate seed data on a second call', () => {
    loadSeedIfEmpty();
    const firstCount = useWordsStore.getState().items.length;
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items.length).toBe(firstCount);
  });

  it('does not overwrite existing user data', () => {
    useWordsStore.getState().add({
      id: 'user-word-1',
      english: 'custom',
      translation: 'своё',
      category: 'Other',
      tags: [],
      dateAdded: '2026-09-24',
      review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
    });
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items).toEqual([expect.objectContaining({ id: 'user-word-1' })]);
  });
});
