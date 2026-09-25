import { describe, it, expect } from 'vitest';
import { initHomeworkProgress, computeHomeworkScore, homeworkProgressFraction, parseHomeworkImport } from './homework';
import { Exercise, Homework } from '@/types/models';

const exercises: Exercise[] = [
  { id: 'ex1', type: 'fill-blank', instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }, { text: 'They ___ here.', blanks: [['were']] }] },
];

describe('initHomeworkProgress', () => {
  it('creates blank progress matching each exercise item count', () => {
    const progress = initHomeworkProgress(exercises);
    expect(progress.ex1.userAnswers).toEqual([[''], ['']]);
    expect(progress.ex1.checked).toEqual([false, false]);
    expect(progress.ex1.correct).toEqual([false, false]);
  });
});

describe('computeHomeworkScore', () => {
  it('sums correct/total across all exercises using current progress answers', () => {
    const homework: Homework = {
      id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress',
      exercises,
      progress: { ex1: { userAnswers: [['was'], ['are']], checked: [true, true], correct: [true, false] } },
    };
    expect(computeHomeworkScore(homework)).toEqual({ correct: 1, total: 2 });
  });
});

describe('homeworkProgressFraction', () => {
  it('counts how many items have been checked out of the total', () => {
    const homework: Homework = {
      id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress',
      exercises,
      progress: { ex1: { userAnswers: [['was'], ['']], checked: [true, false], correct: [true, false] } },
    };
    expect(homeworkProgressFraction(homework)).toEqual({ done: 1, total: 2 });
  });
});

describe('parseHomeworkImport', () => {
  it('parses a valid JSON homework file into a Homework object with initialized progress', () => {
    const raw = JSON.stringify({
      title: 'Unit 11 — was/were',
      assignedDate: '2026-09-24',
      dueDate: '2026-09-26',
      sourceNote: 'from screenshot',
      exercises: [{ type: 'fill-blank', instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }],
    });
    const homework = parseHomeworkImport(raw);
    expect(homework.title).toBe('Unit 11 — was/were');
    expect(homework.status).toBe('not-started');
    expect(homework.exercises).toHaveLength(1);
    expect(homework.exercises[0].id).toBeTruthy();
    expect(homework.progress[homework.exercises[0].id].userAnswers).toEqual([['']]);
  });

  it('throws on missing required fields', () => {
    expect(() => parseHomeworkImport(JSON.stringify({ title: 'No exercises' }))).toThrow();
    expect(() => parseHomeworkImport(JSON.stringify({ exercises: [] }))).toThrow();
  });

  it('rejects an exercise with an unsupported type', () => {
    const raw = JSON.stringify({
      title: 'Bad type',
      exercises: [{ type: 'translation', instruction: 'Translate.', items: [{ text: 'Hello' }] }],
    });
    expect(() => parseHomeworkImport(raw)).toThrow(/unsupported exercise type/i);
  });

  it('rejects a fill-blank item whose blanks count does not match its ___ markers', () => {
    const raw = JSON.stringify({
      title: 'Mismatched blanks',
      exercises: [
        {
          type: 'fill-blank',
          instruction: 'Fill was/were.',
          items: [{ text: 'Last year she ___ 22, so she ___ 23 now.', blanks: [['was']] }],
        },
      ],
    });
    expect(() => parseHomeworkImport(raw)).toThrow(/mismatched number of ___ markers/i);
  });

  it('rejects a multiple-choice item with an out-of-range correctIndex', () => {
    const raw = JSON.stringify({
      title: 'Bad correctIndex',
      exercises: [
        {
          type: 'multiple-choice',
          instruction: 'Choose the right form.',
          items: [{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is'], correctIndex: 5 }],
        },
      ],
    });
    expect(() => parseHomeworkImport(raw)).toThrow(/invalid options\/correctIndex/i);
  });
});
