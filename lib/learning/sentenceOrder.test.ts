import { describe, it, expect } from 'vitest';
import { parseSentenceLines, sentenceChips, seededRandom } from './sentenceOrder';
import { buildAssignedHomework, withSentenceAnswer, computeHomeworkScore, homeworkProgressFraction, parseHomeworkImport } from './homework';
import { SentenceOrderItem } from '@/types/models';

describe('parseSentenceLines', () => {
  it('reads one sentence per line with an optional translation after =', () => {
    expect(parseSentenceLines('Why were you late? = Почему ты опоздала?\n\n  I was at home.  \nHi\n')).toEqual([
      { sentence: 'Why were you late?', translation: 'Почему ты опоздала?' },
      { sentence: 'I was at home.' },
    ]);
  });
});

describe('sentenceChips', () => {
  it('shuffles the words the same way every time (and on every device), never in the right order', () => {
    const item = { sentence: 'Why were you late?' };
    const a = sentenceChips(item);
    expect(a.tokens).toEqual(['Why', 'were', 'you', 'late']);
    expect(a.ending).toBe('?');
    expect([...a.chips].sort()).toEqual([...a.tokens].sort());
    expect(a.chips.join(' ')).not.toBe('Why were you late');
    expect(sentenceChips(item).chips).toEqual(a.chips);
  });

  it('seededRandom is deterministic', () => {
    const r1 = seededRandom('x');
    const r2 = seededRandom('x');
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });
});

describe('homework with «Собери предложение»', () => {
  const input = { bookNumbers: [''], teacherNotes: '', images: [], assignedDate: '2026-10-01', dueDate: '', sentences: 'Why were you late? = Почему ты опоздала?\nWe were at home.' };

  it('can be made of sentences only', () => {
    const hw = buildAssignedHomework(input, 3);
    expect(hw.title).toBe('🧩 Собери предложение');
    expect(hw.exercises).toHaveLength(1);
    expect(hw.exercises[0]).toMatchObject({ type: 'sentence-order', instruction: '🧩 Соберите предложения из слов' });
    expect((hw.exercises[0].items as SentenceOrderItem[]).map((i) => i.sentence)).toEqual(['Why were you late?', 'We were at home.']);
  });

  it('adds the game after the book numbers when both are given', () => {
    const hw = buildAssignedHomework({ ...input, bookNumbers: ['12.1'] }, 3);
    expect(hw.title).toBe('Упражнения 12.1 + 🧩');
    expect(hw.exercises.map((e) => e.type)).toEqual(['free-text', 'sentence-order']);
  });

  it('needs book numbers or sentences', () => {
    expect(() => buildAssignedHomework({ ...input, sentences: '  ' }, 3)).toThrow('Добавьте номер из книги, предложения для игры или слова.');
  });

  it('checks a completed sentence, scores the first try, and allows fixing it', () => {
    const hw = buildAssignedHomework(input, 3);
    const ex = hw.exercises[0];
    const { chips, tokens } = sentenceChips((ex.items as SentenceOrderItem[])[0]);
    const order = (words: string[]) => {
      const used = new Set<number>();
      return words.map((w) => { const k = chips.findIndex((c, idx) => c === w && !used.has(idx)); used.add(k); return String(k); });
    };
    const wrong = [...tokens].reverse();

    let h = withSentenceAnswer(hw, ex.id, 0, order(wrong.slice(0, 2)));
    expect(h.progress[ex.id].checked[0]).toBe(false);
    expect(h.status).toBe('in-progress');

    h = withSentenceAnswer(h, ex.id, 0, order(wrong));
    expect(h.progress[ex.id]).toMatchObject({ checked: [true, false], correct: [false, false] });

    h = withSentenceAnswer(h, ex.id, 0, order(tokens)); // fixed, but the first try stays the score
    expect(h.progress[ex.id].correct[0]).toBe(false);
    expect(computeHomeworkScore(h)).toEqual({ correct: 0, total: 2 });
    expect(homeworkProgressFraction(h)).toEqual({ done: 1, total: 2 });
  });

  it('accepts the exercise type in JSON import', () => {
    const hw = parseHomeworkImport(JSON.stringify({ title: 'X', exercises: [{ type: 'sentence-order', instruction: 'Build', items: [{ sentence: 'I am here.' }] }] }));
    expect(hw.exercises[0].type).toBe('sentence-order');
  });
});
