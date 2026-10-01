import { describe, it, expect } from 'vitest';
import { parseWordLines, prepareHomeworkWords, syncWordListProgress, HOMEWORK_WORDS_TOPIC } from './homeworkWords';
import { buildAssignedHomework, computeHomeworkScore, homeworkProgressFraction } from './homework';
import { createInitialReviewState } from './review';
import { Word, WordListItem } from '@/types/models';

const today = new Date('2026-10-01T10:00:00');
const word = (id: string, english: string, translation: string, correctCount = 0): Word => ({
  id, english, translation, category: 'home', tags: [], dateAdded: '2026-09-25', review: { ...createInitialReviewState(), correctCount },
});

describe('parseWordLines', () => {
  it('reads «english = перевод» lines and reports the ones without a translation', () => {
    expect(parseWordLines('window = окно\n  lamp shade=абажур \n\ndoor\n')).toEqual({
      words: [{ english: 'window', translation: 'окно' }, { english: 'lamp shade', translation: 'абажур' }],
      skipped: ['door'],
    });
  });
});

describe('prepareHomeworkWords', () => {
  it('adds new words to the base and reuses ones already there', () => {
    const existing = [word('w-chair', 'chair', 'стул')];
    const { items, newWords } = prepareHomeworkWords('Chair = стул\nwindow = окно', existing, today);
    expect(newWords).toHaveLength(1);
    expect(newWords[0]).toMatchObject({ english: 'window', translation: 'окно', category: HOMEWORK_WORDS_TOPIC, dateAdded: '2026-10-01' });
    expect(items).toEqual([
      { wordId: 'w-chair', english: 'chair', translation: 'стул' },
      { wordId: newWords[0].id, english: 'window', translation: 'окно' },
    ]);
  });
});

describe('homework with words to learn', () => {
  const items: WordListItem[] = [
    { wordId: 'a', english: 'chair', translation: 'стул' },
    { wordId: 'b', english: 'window', translation: 'окно' },
  ];
  const input = { bookNumbers: [], teacherNotes: '', images: [], assignedDate: '2026-10-01', dueDate: '', wordItems: items };

  it('can be made of words only, and words are not part of the score', () => {
    const hw = buildAssignedHomework(input, 4);
    expect(hw.title).toBe('📚 Слова');
    expect(hw.exercises[0]).toMatchObject({ type: 'word-list', instruction: '📚 Выучите слова' });
    expect(computeHomeworkScore(hw)).toEqual({ correct: 0, total: 0 });
  });

  it('marks a word learned once it was answered «Знаю» anywhere', () => {
    const hw = buildAssignedHomework(input, 4);
    const unchanged = syncWordListProgress(hw, [word('a', 'chair', 'стул'), word('b', 'window', 'окно')]);
    expect(unchanged).toBe(hw);
    const synced = syncWordListProgress(hw, [word('a', 'chair', 'стул', 1), word('b', 'window', 'окно')]);
    expect(synced.progress[hw.exercises[0].id].checked).toEqual([true, false]);
    expect(synced.status).toBe('in-progress');
    expect(homeworkProgressFraction(synced)).toEqual({ done: 1, total: 2 });
  });
});
