import { Homework, Word, WordListItem } from '@/types/models';
import { createInitialReviewState } from './review';
import { toISODate } from './date';
import { generateId } from '@/lib/utils';

/** Topic for words that came with homework (see lib/seed/topics.ts). */
export const HOMEWORK_WORDS_TOPIC = 'homework-words';

/** Teacher input: «english = перевод», one per line. Lines without a translation are reported, not guessed. */
export function parseWordLines(text: string): { words: { english: string; translation: string }[]; skipped: string[] } {
  const words: { english: string; translation: string }[] = [];
  const skipped: string[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const [english, ...rest] = line.split('=');
    const translation = rest.join('=').trim();
    if (english.trim() && translation) words.push({ english: english.trim(), translation });
    else skipped.push(line);
  }
  return { words, skipped };
}

/**
 * Words for a homework: ones already in the base are reused (no duplicates, their progress is kept);
 * the rest become new words in «Слова из домашки», ready for review straight away.
 */
export function prepareHomeworkWords(text: string, existing: Word[], today: Date = new Date()): { items: WordListItem[]; newWords: Word[] } {
  const newWords: Word[] = [];
  const items = parseWordLines(text).words.map(({ english, translation }) => {
    const found = [...existing, ...newWords].find((w) => w.english.toLowerCase() === english.toLowerCase());
    if (found) return { wordId: found.id, english: found.english, translation: found.translation };
    const created: Word = {
      id: generateId(),
      english,
      translation,
      category: HOMEWORK_WORDS_TOPIC,
      tags: [],
      dateAdded: toISODate(today),
      review: createInitialReviewState(today),
    };
    newWords.push(created);
    return { wordId: created.id, english, translation };
  });
  return { items, newWords };
}

/** A homework word counts as learned once it was answered «Знаю» in flashcards (anywhere in the app). */
export function syncWordListProgress(homework: Homework, words: Word[]): Homework {
  let changed = false;
  const progress = { ...homework.progress };
  for (const ex of homework.exercises) {
    if (ex.type !== 'word-list') continue;
    const p = progress[ex.id];
    const checked = (ex.items as WordListItem[]).map((item, i) => p.checked[i] || (words.find((w) => w.id === item.wordId)?.review.correctCount ?? 0) > 0);
    if (checked.some((c, i) => c !== p.checked[i])) {
      changed = true;
      progress[ex.id] = { ...p, checked };
    }
  }
  if (!changed) return homework;
  return { ...homework, progress, status: homework.status === 'not-started' ? 'in-progress' : homework.status };
}
