import { describe, it, expect, beforeEach } from 'vitest';
import { mergeSeed } from './mergeSeed';
import { seedWords } from './words';
import { seedGrammarTopics } from './grammar';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';

const userWord = {
  id: 'user-word-1',
  english: 'custom',
  translation: 'своё',
  category: 'Other',
  tags: [],
  dateAdded: '2026-09-24',
  review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
};

describe('mergeSeed', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: false });
    usePhrasesStore.setState({ items: [], hydrated: false });
    useGrammarStore.setState({ items: [], hydrated: false });
  });

  it('populates all three stores when empty', () => {
    mergeSeed();
    expect(useWordsStore.getState().items.length).toBe(seedWords.length);
    expect(usePhrasesStore.getState().items.length).toBeGreaterThan(0);
    expect(useGrammarStore.getState().items.length).toBe(seedGrammarTopics.length);
  });

  it('does not duplicate seed data on a second call', () => {
    mergeSeed();
    const firstCount = useWordsStore.getState().items.length;
    mergeSeed();
    expect(useWordsStore.getState().items.length).toBe(firstCount);
  });

  it('adds new seed content alongside existing user data', () => {
    useWordsStore.getState().add(userWord);
    mergeSeed();
    const ids = useWordsStore.getState().items.map((i) => i.id);
    expect(ids).toContain('user-word-1');
    expect(ids).toContain(seedWords[0].id);
  });

  it('keeps review progress on seed words already present', () => {
    mergeSeed();
    const word = useWordsStore.getState().items[0];
    const learned = { ...word, review: { ...word.review, level: 3, status: 'review' as const } };
    useWordsStore.getState().update(learned);
    mergeSeed();
    expect(useWordsStore.getState().items.find((i) => i.id === word.id)?.review.level).toBe(3);
  });

  it('does not bring back a seed word the user deleted', () => {
    mergeSeed();
    const id = seedWords[0].id;
    useWordsStore.getState().remove(id);
    mergeSeed();
    expect(useWordsStore.getState().items.some((i) => i.id === id)).toBe(false);
  });

  it('replaces an outdated seed grammar topic with the current version', () => {
    const latest = seedGrammarTopics[0];
    useGrammarStore.getState().add({ ...latest, explanation: 'old text', practiceExercises: [] });
    mergeSeed();
    expect(useGrammarStore.getState().items.find((t) => t.id === latest.id)).toEqual(latest);
  });
});
