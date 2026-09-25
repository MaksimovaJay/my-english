'use client';

import { useMemo } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { TOPICS } from '@/lib/seed/topics';
import { buildTopicContents, TopicContent } from '@/lib/learning/topics';
import { VocabItem } from '@/types/models';

export function useTopicContents(): TopicContent[] {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const grammar = useGrammarStore((s) => s.items);
  return useMemo(() => buildTopicContents(TOPICS, words, phrases, grammar), [words, phrases, grammar]);
}

/** Saves a reviewed item to whichever store (words or phrases) holds it. */
export function useUpdateVocabItem(): (item: VocabItem) => void {
  const words = useWordsStore((s) => s.items);
  const updateWord = useWordsStore((s) => s.update);
  const updatePhrase = usePhrasesStore((s) => s.update);
  return (item) => {
    if (words.some((w) => w.id === item.id)) updateWord(item);
    else updatePhrase(item);
  };
}
