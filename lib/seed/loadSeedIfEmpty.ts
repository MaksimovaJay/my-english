import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { seedWords } from './words';
import { seedPhrases } from './phrases';
import { seedGrammarTopics } from './grammar';

export function loadSeedIfEmpty(): void {
  const words = useWordsStore.getState();
  if (words.items.length === 0) seedWords.forEach((item) => words.add(item));

  const phrases = usePhrasesStore.getState();
  if (phrases.items.length === 0) seedPhrases.forEach((item) => phrases.add(item));

  const grammar = useGrammarStore.getState();
  if (grammar.items.length === 0) seedGrammarTopics.forEach((item) => grammar.add(item));
}
