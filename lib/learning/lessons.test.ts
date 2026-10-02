import { describe, it, expect } from 'vitest';
import { buildLesson, completeLesson, nextLessonNumber, DEFAULT_LESSON_GAMES, lessonDeletion } from './lessons';
import { createInitialReviewState } from './review';
import { initHomeworkProgress } from './homework';
import { Exercise, Lesson, Topic, Word } from '@/types/models';

const today = new Date('2026-10-02T10:00:00');
const topics: Topic[] = [{ id: 'home', title: 'Дом', emoji: '🏠', group: 'class', order: 3 }];

describe('buildLesson', () => {
  it('reads the form into a planned lesson with an empty exercise list', () => {
    const lesson = buildLesson(
      { title: ' Past simple ', date: '2026-10-03', description: 'Про выходные', images: ['img'], words: 'noisy = шумный\nquiet = тихий\nbad line', conditions: 'Сначала слова', rules: 'was / were', games: ['flashcards', 'matching'] },
      4
    );
    expect(lesson).toMatchObject({
      number: 4, title: 'Past simple', date: '2026-10-03', status: 'planned', description: 'Про выходные', images: ['img'],
      words: [{ english: 'noisy', translation: 'шумный' }, { english: 'quiet', translation: 'тихий' }],
      conditions: 'Сначала слова', rules: 'was / were', games: ['flashcards', 'matching'],
    });
    expect(lesson.practice.exercises).toEqual([]);
  });

  it('needs a title', () => {
    expect(() => buildLesson({ title: ' ', date: '2026-10-03', images: [], words: '', games: [] }, 1)).toThrow('Напишите название урока.');
  });

  it('numbers lessons in order', () => {
    expect(nextLessonNumber([])).toBe(1);
    expect(nextLessonNumber([{ number: 2 }, { number: 5 }] as Lesson[])).toBe(6);
    expect(DEFAULT_LESSON_GAMES).toContain('flashcards');
  });
});

describe('completeLesson', () => {
  const exercises: Exercise[] = [
    { id: 'fb', type: 'fill-blank', instruction: '1a', items: [{ text: 'She ___ 22.', blanks: [['was']] }] },
    { id: 'wb', type: 'word-bank', instruction: 'bank', items: [{ text: 'It ___ cold.', blanks: [['was']] }], bank: ['was', 'were'] },
    { id: 'so', type: 'sentence-order', instruction: 'order', items: [{ sentence: 'We were at home.', translation: 'Мы были дома.' }] },
    { id: 'ft', type: 'free-text', instruction: 'write', items: [{ prompt: '' }] },
  ];

  function lesson(): Lesson {
    const l = buildLesson({ title: 'Past simple', date: '2026-10-02', images: [], words: 'noisy = шумный\nchair = стул', rules: 'was — с I/he/she/it', conditions: 'Сначала слова', games: [] }, 3);
    return { ...l, practice: { ...l.practice, exercises, progress: initHomeworkProgress(exercises) } };
  }
  const existing: Word = { id: 'w-chair', english: 'chair', translation: 'стул', category: 'home', tags: [], dateAdded: '2026-09-25', review: createInitialReviewState() };

  it('makes a topic with the lesson words, sentences and rule', () => {
    const result = completeLesson(lesson(), [existing], topics, today);
    expect(result.topic).toMatchObject({ title: 'Past simple', emoji: '🎓', group: 'class', custom: true });
    expect(result.newWords.map((w) => [w.english, w.category])).toEqual([['noisy', result.topic.id]]);
    expect(result.phrases.map((p) => [p.english, p.translation, p.category])).toEqual([['We were at home.', 'Мы были дома.', result.topic.id]]);
    expect(result.grammar).toMatchObject({ topicId: result.topic.id, title: 'Правило: Past simple' });
    expect(result.grammar!.explanation).toContain('was — с I/he/she/it');
    expect(result.grammar!.practiceExercises.map((e) => [e.type, e.instruction])).toEqual([['fill-blank', '1a'], ['fill-blank', 'bank']]);
    expect(result.lesson).toMatchObject({ status: 'completed', topicId: result.topic.id });
  });

  it('skips the grammar topic when there is neither a rule nor a checkable exercise', () => {
    const l = buildLesson({ title: 'Words only', date: '2026-10-02', images: [], words: 'tree = дерево', games: [] }, 1);
    expect(completeLesson(l, [], topics, today).grammar).toBeNull();
  });
});

describe('lessonDeletion', () => {
  it('lists everything the completion created, but not words that existed before', () => {
    const l = buildLesson({ title: 'L', date: '2026-10-02', images: [], words: 'noisy = шумный\nchair = стул', rules: 'r', games: [] }, 1);
    const existing: Word = { id: 'w-chair', english: 'chair', translation: 'стул', category: 'home', tags: [], dateAdded: '2026-09-25', review: createInitialReviewState() };
    const { lesson: done, newWords, topic, grammar } = completeLesson(l, [existing], topics, today);
    expect(lessonDeletion(done)).toEqual({ topicId: topic.id, wordIds: newWords.map((w) => w.id), phraseIds: [], grammarId: grammar!.id });
    expect(lessonDeletion(done).wordIds).not.toContain('w-chair');
  });

  it('is empty for a lesson that was never finished', () => {
    const l = buildLesson({ title: 'L', date: '2026-10-02', images: [], words: '', games: [] }, 1);
    expect(lessonDeletion(l)).toEqual({ topicId: undefined, wordIds: [], phraseIds: [], grammarId: undefined });
  });
});

describe('completeLesson word examples', () => {
  it('carries word examples into the topic', () => {
    const l = buildLesson({ title: 'L', date: '2026-10-02', images: [], words: 'hot = жаркий', games: [] }, 1);
    const withExample = { ...l, words: [{ ...l.words[0], example: 'It was hot.', exampleTranslation: 'Было жарко.' }] };
    expect(completeLesson(withExample, [], topics, today).newWords[0]).toMatchObject({ example: 'It was hot.', exampleTranslation: 'Было жарко.' });
  });
});
