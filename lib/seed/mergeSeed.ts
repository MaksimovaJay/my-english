import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { seedWords } from './words';
import { seedPhrases } from './phrases';
import { seedGrammarTopics } from './grammar';

const SEEN_KEY = 'mjay-english:seed-seen';

function readSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

/**
 * Brings seed content (lesson material that ships with the app) into the
 * local stores. New seed items are added on every device, even one that
 * already has data. Seed words/phrases the user has already seen are never
 * re-added or overwritten, so their review progress and any deletions stick.
 * Seed grammar topics are not editable in the UI, so they are always
 * replaced with the latest version from the code.
 */
export function mergeSeed(): void {
  const seen = readSeen();

  for (const store of [useWordsStore, usePhrasesStore]) {
    const state = store.getState();
    const existing = new Set(state.items.map((i) => i.id));
    const seed = store === useWordsStore ? seedWords : seedPhrases;
    for (const item of seed) {
      if (!existing.has(item.id) && !seen.has(item.id)) state.add(item);
      seen.add(item.id);
    }
  }

  const grammar = useGrammarStore.getState();
  for (const topic of seedGrammarTopics) {
    const current = grammar.items.find((t) => t.id === topic.id);
    if (current) {
      if (JSON.stringify(current) !== JSON.stringify(topic)) grammar.update(topic);
    } else if (!seen.has(topic.id)) {
      grammar.add(topic);
    }
    seen.add(topic.id);
  }

  writeSeen(seen);
}
