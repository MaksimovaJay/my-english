import { describe, it, expect } from 'vitest';
import { initHomeworkProgress, computeHomeworkScore, homeworkProgressFraction, parseHomeworkImport, nextHomeworkNumber, buildAssignedHomework, withFreeTextAnswer, groupHomeworkByWeek, homeworkMistakes } from './homework';
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

describe('assigned homework (free-text)', () => {
  const base = { assignedDate: '2026-09-26', dueDate: '', teacherNotes: 'Сделать письменно', images: ['data:image/jpeg;base64,xx'] };

  it('numbers after the highest existing homework', () => {
    expect(nextHomeworkNumber([])).toBe(1);
    expect(nextHomeworkNumber([{ number: 1 }, { number: 4 }, {}] as Homework[])).toBe(5);
  });

  it('builds one free-text exercise per non-empty book number', () => {
    const hw = buildAssignedHomework({ ...base, bookNumbers: ['12.1', '  ', '12.3 '] }, 2);
    expect(hw.number).toBe(2);
    expect(hw.title).toBe('Упражнения 12.1, 12.3');
    expect(hw.exercises.map((e) => [e.type, e.instruction])).toEqual([['free-text', 'Упражнение 12.1'], ['free-text', 'Упражнение 12.3']]);
    expect(hw.teacherNotes).toBe('Сделать письменно');
    expect(hw.images).toHaveLength(1);
    expect(hw.dueDate).toBeUndefined();
    expect(hw.progress[hw.exercises[0].id]).toEqual({ userAnswers: [['']], checked: [false], correct: [false] });
  });

  it('rejects an assignment with no book numbers', () => {
    expect(() => buildAssignedHomework({ ...base, bookNumbers: ['', ' '] }, 1)).toThrow('Добавьте хотя бы один номер');
  });

  it('marks a free-text item done when the answer is non-empty and leaves score to the teacher', () => {
    const hw = buildAssignedHomework({ ...base, bookNumbers: ['12.1'] }, 2);
    const exId = hw.exercises[0].id;
    const answered = withFreeTextAnswer(hw, exId, 0, 'I was at home.');
    expect(answered.progress[exId].checked).toEqual([true]);
    expect(answered.status).toBe('in-progress');
    expect(homeworkProgressFraction(answered)).toEqual({ done: 1, total: 1 });
    expect(computeHomeworkScore(answered)).toEqual({ correct: 0, total: 0 });
    expect(withFreeTextAnswer(answered, exId, 0, '   ').progress[exId].checked).toEqual([false]);
  });

  it('accepts free-text exercises in JSON import', () => {
    const hw = parseHomeworkImport(JSON.stringify({ title: 'X', exercises: [{ type: 'free-text', instruction: 'Write', items: [{ prompt: '' }] }] }));
    expect(hw.exercises[0].type).toBe('free-text');
  });
});

describe('groupHomeworkByWeek', () => {
  const hw = (id: string, assignedDate: string) => ({ id, assignedDate } as Homework);

  it('groups by Monday–Sunday week, newest week and newest homework first', () => {
    const groups = groupHomeworkByWeek([hw('a', '2026-09-22'), hw('b', '2026-09-28'), hw('c', '2026-09-27'), hw('d', '2026-09-25')]);
    expect(groups.map((g) => [g.label, g.items.map((h) => h.id)])).toEqual([
      ['Неделя 28 сентября – 4 октября', ['b']],
      ['Неделя 21–27 сентября', ['c', 'd', 'a']],
    ]);
  });
});

describe('homeworkMistakes', () => {
  it('collects checked-wrong items as small exercises, per homework and exercise', () => {
    const exs: Exercise[] = [
      { id: 'fb', type: 'fill-blank', instruction: '11.2 Fill in', items: [{ text: 'She ___ 22.', blanks: [['was']] }, { text: 'I ___ ok.', blanks: [['am']] }] },
      { id: 'mc', type: 'multiple-choice', instruction: 'Choose', items: [{ question: 'I ___', options: ['am', 'is'], correctIndex: 0 }] },
      { id: 'ft', type: 'free-text', instruction: 'Write', items: [{ prompt: '' }] },
    ];
    const hwk: Homework = {
      id: 'h1', number: 3, title: 'Unit 11', assignedDate: '2026-09-26', status: 'completed', exercises: exs,
      progress: {
        fb: { userAnswers: [['is'], ['am']], checked: [true, true], correct: [false, true] },
        mc: { userAnswers: [1], checked: [true], correct: [false] },
        ft: { userAnswers: [['text']], checked: [true], correct: [false] },
      },
    };
    const clean: Homework = { ...hwk, id: 'h2', progress: { fb: { userAnswers: [['was'], ['am']], checked: [true, true], correct: [true, true] }, mc: { userAnswers: [0], checked: [true], correct: [true] }, ft: hwk.progress.ft } };
    const result = homeworkMistakes([hwk, clean]);
    expect(result.map((e) => [e.id, e.type, e.instruction, e.items.length])).toEqual([
      ['mistakes-h1-fb', 'fill-blank', 'ДЗ 3 · 11.2 Fill in', 1],
      ['mistakes-h1-mc', 'multiple-choice', 'ДЗ 3 · Choose', 1],
    ]);
    expect(result[0].items[0]).toEqual({ text: 'She ___ 22.', blanks: [['was']] });
  });
});
