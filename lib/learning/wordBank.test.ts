import { describe, it, expect } from 'vitest';
import { parseBankSentences, buildBank, wordBankRound } from './wordBank';
import { buildAssignedHomework, withWordBankAnswer, computeHomeworkScore, homeworkProgressFraction } from './homework';
import { createInitialReviewState } from './review';
import { VocabItem } from '@/types/models';

describe('parseBankSentences', () => {
  it('turns [answer] into a blank, with / for alternatives', () => {
    expect(parseBankSentences('The streets were [noisy] in NY.\nThis car [is/was] red.\nNo blanks here.\n')).toEqual([
      { text: 'The streets were ___ in NY.', blanks: [['noisy']] },
      { text: 'This car ___ red.', blanks: [['is', 'was']] },
    ]);
  });
});

describe('buildBank', () => {
  it('lists each answer once plus the extra words, in a stable shuffled order', () => {
    const items = parseBankSentences('The kids [were] quiet.\nMy homework [was] hard.\nThe streets [were] [noisy].');
    const bank = buildBank(items, 'fast, spicy, , noisy');
    expect([...bank].sort()).toEqual(['fast', 'noisy', 'spicy', 'was', 'were']);
    expect(buildBank(items, 'fast, spicy, , noisy')).toEqual(bank);
  });
});

describe('wordBankRound (game)', () => {
  const v = (id: string, english: string, example?: string): VocabItem => ({
    id, english, translation: id, category: 'x', tags: [], dateAdded: '2026-10-01', example, review: createInitialReviewState(),
  });

  it('blanks the word in its example and offers it among other words', () => {
    const items = [v('t', 'table', 'The book is on the table.'), v('s', 'sofa', 'The sofa is red.'), v('b', 'bed'), v('l', 'lamp'), v('c', 'chair'), v('k', 'kitchen', 'No word here.')];
    const round = wordBankRound(items, () => 0)!;
    expect(['table', 'sofa']).toContain(round.answer);
    expect(round.text).toContain('___');
    expect(round.text).not.toMatch(new RegExp(`\\b${round.answer}\\b`, 'i'));
    expect(round.bank).toContain(round.answer);
    expect(new Set(round.bank).size).toBe(round.bank.length);
    expect(round.bank.length).toBe(5);
  });

  it('needs at least one example with the word in it', () => {
    expect(wordBankRound([v('b', 'bed'), v('k', 'kitchen', 'No word here.')])).toBeNull();
  });
});

describe('homework «Вставь слово»', () => {
  const input = {
    bookNumbers: [], teacherNotes: '', images: [], assignedDate: '2026-10-01', dueDate: '',
    bankSentences: 'The streets were [noisy] in NY.\nThe kids in the room [were] quiet.', bankExtra: 'fast, spicy',
  };

  it('builds a word-bank exercise with its list of words', () => {
    const hw = buildAssignedHomework(input, 5);
    expect(hw.title).toBe('🔤 Вставь слово');
    const ex = hw.exercises[0];
    expect(ex).toMatchObject({ type: 'word-bank', instruction: '🔤 Вставьте слова из списка' });
    expect([...(ex.bank ?? [])].sort()).toEqual(['fast', 'noisy', 'spicy', 'were']);
    expect(hw.progress[ex.id].userAnswers).toEqual([[''], ['']]);
  });

  it('checks a sentence once its blanks are filled; the first try is the score', () => {
    const hw = buildAssignedHomework(input, 5);
    const id = hw.exercises[0].id;
    let h = withWordBankAnswer(hw, id, 0, ['quiet']);
    expect(h.progress[id]).toMatchObject({ checked: [true, false], correct: [false, false] });
    h = withWordBankAnswer(h, id, 0, ['noisy']);
    expect(h.progress[id].correct[0]).toBe(false);
    h = withWordBankAnswer(h, id, 1, ['Were']);
    expect(h.progress[id]).toMatchObject({ checked: [true, true], correct: [false, true] });
    expect(computeHomeworkScore(h)).toEqual({ correct: 1, total: 2 });
    expect(homeworkProgressFraction(h)).toEqual({ done: 2, total: 2 });
  });
});
