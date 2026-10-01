'use client';

import { useMemo } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { TOPICS } from '@/lib/seed/topics';
import { useTopicsStore } from '@/lib/storage/topicsStore';
import { effectiveTopics } from '@/lib/learning/topicEdits';
import { buildTopicContents, TopicContent } from '@/lib/learning/topics';
import { Topic, VocabItem } from '@/types/models';

/** Built-in topics with the user's renames / deletions applied, plus topics the user created. */
export function useTopics(): Topic[] {
  const docs = useTopicsStore((s) => s.items);
  return useMemo(() => effectiveTopics(TOPICS, docs), [docs]);
}

export function useTopicContents(): TopicContent[] {
  const topics = useTopics();
  const docs = useTopicsStore((s) => s.items);
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const grammar = useGrammarStore((s) => s.items);
  return useMemo(() => {
    const custom = new Set(docs.filter((d) => d.custom && !d.hidden).map((d) => d.id));
    return buildTopicContents(topics, words, phrases, grammar, custom);
  }, [topics, docs, words, phrases, grammar]);
}

/** Removes a word or phrase from whichever store holds it. */
export function useRemoveVocabItem(): (id: string) => void {
  const words = useWordsStore((s) => s.items);
  const removeWord = useWordsStore((s) => s.remove);
  const removePhrase = usePhrasesStore((s) => s.remove);
  return (id) => {
    if (words.some((w) => w.id === id)) removeWord(id);
    else removePhrase(id);
  };
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
