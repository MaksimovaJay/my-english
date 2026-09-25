import { Word, Phrase, GrammarTopic, Exercise, Homework } from '@/types/models';
import { useWordsStore } from './wordsStore';
import { usePhrasesStore } from './phrasesStore';
import { useGrammarStore } from './grammarStore';
import { useExercisesStore } from './exercisesStore';
import { useHomeworkStore } from './homeworkStore';
import { createInitialReviewState } from '@/lib/learning/review';
import { generateId } from '@/lib/utils';

export interface ExportedData {
  version: 1;
  words: Word[];
  phrases: Phrase[];
  grammarTopics: GrammarTopic[];
  exercises: Exercise[];
  homeworks: Homework[];
}

export function exportAllData(): ExportedData {
  return {
    version: 1,
    words: useWordsStore.getState().items,
    phrases: usePhrasesStore.getState().items,
    grammarTopics: useGrammarStore.getState().items,
    exercises: useExercisesStore.getState().items,
    homeworks: useHomeworkStore.getState().items,
  };
}

function upsert<T extends { id: string }>(
  store: { getState: () => { items: T[]; add: (i: T) => void; update: (i: T) => void } },
  item: T
): void {
  const exists = store.getState().items.some((i) => i.id === item.id);
  if (exists) store.getState().update(item);
  else store.getState().add(item);
}

function hasStringId(item: unknown): item is { id: string } {
  return Boolean(item) && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string';
}

export function importAllData(raw: string): void {
  const data = JSON.parse(raw) as Partial<ExportedData> | null;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import file: expected a JSON object.');
  }
  (data.words ?? []).filter(hasStringId).forEach((w) => upsert(useWordsStore, w));
  (data.phrases ?? []).filter(hasStringId).forEach((p) => upsert(usePhrasesStore, p));
  (data.grammarTopics ?? []).filter(hasStringId).forEach((g) => upsert(useGrammarStore, g));
  (data.exercises ?? []).filter(hasStringId).forEach((e) => upsert(useExercisesStore, e));
  (data.homeworks ?? []).filter(hasStringId).forEach((h) => upsert(useHomeworkStore, h));
}

export function importVocabCsv(raw: string): number {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return 0;
  const rows = lines.slice(1);
  let count = 0;
  for (const row of rows) {
    const [english, translation, ipa, ruPronunciation, example, category] = row.split(',').map((c) => c.trim());
    if (!english || !translation || !category) continue;
    useWordsStore.getState().add({
      id: generateId(),
      english,
      translation,
      ipa: ipa || undefined,
      ruPronunciation: ruPronunciation || undefined,
      example: example || undefined,
      category,
      tags: [],
      dateAdded: new Date().toISOString().slice(0, 10),
      review: createInitialReviewState(),
    });
    count++;
  }
  return count;
}
