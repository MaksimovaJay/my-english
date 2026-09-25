import { describe, it, expect, beforeEach } from 'vitest';
import { exportAllData, importAllData, importVocabCsv } from './exportImport';
import { useWordsStore } from './wordsStore';
import { usePhrasesStore } from './phrasesStore';
import { useGrammarStore } from './grammarStore';
import { useExercisesStore } from './exercisesStore';
import { useHomeworkStore } from './homeworkStore';

const word = {
  id: 'w1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
  review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
};

describe('exportAllData / importAllData', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    useExercisesStore.setState({ items: [], hydrated: true });
    useHomeworkStore.setState({ items: [], hydrated: true });
  });

  it('exports everything currently in the stores', () => {
    useWordsStore.getState().add(word);
    const data = exportAllData();
    expect(data.version).toBe(1);
    expect(data.words).toEqual([word]);
  });

  it('imports words into the store', () => {
    importAllData(JSON.stringify({ version: 1, words: [word], phrases: [], grammarTopics: [], exercises: [], homeworks: [] }));
    expect(useWordsStore.getState().items).toEqual([word]);
  });

  it('upserts instead of duplicating an item that already exists with the same id', () => {
    useWordsStore.getState().add(word);
    importAllData(JSON.stringify({ version: 1, words: [{ ...word, translation: 'мамочка' }], phrases: [], grammarTopics: [], exercises: [], homeworks: [] }));
    expect(useWordsStore.getState().items).toHaveLength(1);
    expect(useWordsStore.getState().items[0].translation).toBe('мамочка');
  });
});

describe('importVocabCsv', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
  });

  it('parses a header + rows CSV into new words', () => {
    const csv = 'english,translation,ipa,ruPronunciation,example,category\ndog,собака,dɒg,дог,I have a dog.,Other';
    expect(importVocabCsv(csv)).toBe(1);
    expect(useWordsStore.getState().items[0]).toMatchObject({ english: 'dog', translation: 'собака', category: 'Other' });
  });

  it('skips rows missing english/translation/category', () => {
    const csv = 'english,translation,ipa,ruPronunciation,example,category\n,собака,,,,Other';
    expect(importVocabCsv(csv)).toBe(0);
  });
});
