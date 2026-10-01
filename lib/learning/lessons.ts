import { Exercise, FillBlankItem, GameId, GrammarTopic, Lesson, Phrase, SentenceOrderItem, Topic, Word } from '@/types/models';
import { generateId } from '@/lib/utils';
import { parseWordLines } from './homeworkWords';
import { newTopicDoc, TopicDoc } from './topicEdits';
import { createInitialReviewState } from './review';
import { toISODate } from './date';

export const DEFAULT_LESSON_GAMES: GameId[] = ['flashcards', 'matching', 'floating'];

export interface LessonInput {
  title: string;
  date: string;
  description?: string;
  images: string[];
  words: string; // «слово = перевод» per line
  conditions?: string;
  rules?: string;
  games: GameId[];
}

export function nextLessonNumber(lessons: Pick<Lesson, 'number'>[]): number {
  return Math.max(0, ...lessons.map((l) => l.number)) + 1;
}

const optional = (text?: string) => text?.trim() || undefined;

export function buildLesson(input: LessonInput, number: number): Lesson {
  const title = input.title.trim();
  if (!title) throw new Error('Напишите название урока.');
  const id = generateId();
  return {
    id,
    number,
    title,
    date: input.date,
    description: optional(input.description),
    images: input.images.length ? input.images : undefined,
    words: parseWordLines(input.words).words,
    conditions: optional(input.conditions),
    rules: optional(input.rules),
    games: input.games,
    // Exercises are added later (from screenshots), into the same structure homework uses.
    practice: { id: `${id}-practice`, title, assignedDate: input.date, status: 'not-started', exercises: [], progress: {} },
    status: 'planned',
  };
}

export interface LessonCompletion {
  topic: TopicDoc & Topic;
  newWords: Word[];
  phrases: Phrase[];
  grammar: GrammarTopic | null;
  lesson: Lesson;
}

/** Exercises that can live in a topic's «Упражнения» tab (fill-blank / multiple choice; word bank becomes fill-blank). */
function topicExercises(exercises: Exercise[]): Exercise[] {
  return exercises.flatMap((ex): Exercise[] => {
    if (ex.type === 'fill-blank' || ex.type === 'multiple-choice') return [ex];
    if (ex.type === 'word-bank') return [{ id: ex.id, type: 'fill-blank', instruction: ex.instruction, items: ex.items as FillBlankItem[] }];
    return [];
  });
}

/** «Завершить урок»: the lesson's words, sentences, rule and exercises become a new topic. */
export function completeLesson(lesson: Lesson, existingWords: Word[], topics: Topic[], today: Date = new Date()): LessonCompletion {
  const topic = { ...newTopicDoc({ title: lesson.title, emoji: '🎓', group: 'class' }, topics) };
  const dateAdded = toISODate(today);
  const fresh = (english: string, translation: string) => ({
    id: generateId(), english, translation, category: topic.id, tags: [], dateAdded, review: createInitialReviewState(today),
  });

  const newWords: Word[] = [];
  for (const w of lesson.words) {
    const known = [...existingWords, ...newWords].some((e) => e.english.toLowerCase() === w.english.toLowerCase());
    if (!known) newWords.push(fresh(w.english, w.translation));
  }

  const phrases: Phrase[] = lesson.practice.exercises
    .filter((ex) => ex.type === 'sentence-order')
    .flatMap((ex) => (ex.items as SentenceOrderItem[]).map((s) => fresh(s.sentence, s.translation ?? '—')));

  const exercises = topicExercises(lesson.practice.exercises);
  const explanation = [lesson.rules, lesson.conditions && `Условия урока:\n${lesson.conditions}`].filter(Boolean).join('\n\n');
  const grammar: GrammarTopic | null =
    explanation || exercises.length
      ? { id: `lesson-${lesson.id}`, topicId: topic.id, title: `Правило: ${lesson.title}`, explanation, examples: [], practiceExercises: exercises, dateAdded }
      : null;

  const created = { wordIds: newWords.map((w) => w.id), phraseIds: phrases.map((p) => p.id), grammarId: grammar?.id };
  return { topic, newWords, phrases, grammar, lesson: { ...lesson, status: 'completed', topicId: topic.id, created } };
}

/** What deleting a lesson removes: the lesson and everything its completion created (words that existed before stay). */
export function lessonDeletion(lesson: Lesson): { topicId?: string; wordIds: string[]; phraseIds: string[]; grammarId?: string } {
  return {
    topicId: lesson.topicId,
    wordIds: lesson.created?.wordIds ?? [],
    phraseIds: lesson.created?.phraseIds ?? [],
    grammarId: lesson.created?.grammarId,
  };
}
