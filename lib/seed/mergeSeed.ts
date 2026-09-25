import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { seedWords } from './words';
import { seedPhrases } from './phrases';
import { seedGrammarTopics } from './grammar';
import { seedHomeworks } from './homework';

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

// Old sample data from the first version; removed from devices that still have it.
export const RETIRED_SEED_IDS = [
  'seed-word-window', 'seed-word-friend', 'seed-word-teacher', 'seed-word-street', 'seed-word-airport',
  'seed-word-meeting', 'seed-word-deadline', 'seed-word-morning',
  'seed-phrase-how-are-you?', 'seed-phrase-nice-to-meet-you.', 'seed-phrase-what-time-is-it?', 'seed-phrase-i-have-no-idea.',
];

const CONTENT_FIELDS = ['english', 'translation', 'ipa', 'ruPronunciation', 'example', 'exampleTranslation', 'category', 'notes'] as const;

/**
 * Brings seed content (lesson material that ships with the app) into the
 * local stores. New seed items are added on every device, even one that
 * already has data. Seed words/phrases already present get their content
 * (text, translation, topic) refreshed from the code but keep their review
 * progress; ones the user deleted are not re-added. Seed grammar topics are
 * not editable in the UI, so they are always replaced with the latest version.
 */
export function mergeSeed(): void {
  const seen = readSeen();

  for (const store of [useWordsStore, usePhrasesStore]) {
    const state = store.getState();
    const seed = store === useWordsStore ? seedWords : seedPhrases;
    for (const id of RETIRED_SEED_IDS) {
      if (state.items.some((i) => i.id === id)) state.remove(id);
    }
    for (const item of seed) {
      const current = store.getState().items.find((i) => i.id === item.id);
      if (current) {
        if (CONTENT_FIELDS.some((f) => current[f] !== item[f])) {
          const refreshed = { ...current };
          for (const f of CONTENT_FIELDS) (refreshed as Record<string, unknown>)[f] = item[f];
          state.update(refreshed);
        }
      } else if (!seen.has(item.id)) {
        state.add(item);
      }
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

  const homework = useHomeworkStore.getState();
  for (const item of seedHomeworks) {
    if (!seen.has(item.id) && !homework.items.some((h) => h.id === item.id)) homework.add(item);
    seen.add(item.id);
  }

  writeSeen(seen);
}
