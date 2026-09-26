import { describe, it, expect } from 'vitest';
import {
  shuffled, sentencePool, splitSentence, isSentenceCorrect, shuffleTokens,
  letterWords, maskWord, isWordSolved, LETTER_LIVES, timedQuestion,
} from './games';
import { createInitialReviewState } from './review';
import { VocabItem } from '@/types/models';

const v = (id: string, english: string, translation: string, extra: Partial<VocabItem> = {}): VocabItem => ({
  id, english, translation, category: 'x', tags: [], dateAdded: '2026-09-26', review: createInitialReviewState(), ...extra,
});

describe('shuffled', () => {
  it('keeps every element', () => {
    expect(shuffled([1, 2, 3, 4], () => 0.3).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('Собери предложение', () => {
  it('splits a sentence into words and a fixed ending', () => {
    expect(splitSentence('Why were you late this morning?')).toEqual({ tokens: ['Why', 'were', 'you', 'late', 'this', 'morning'], ending: '?' });
    expect(splitSentence("I don't know where it is.")).toEqual({ tokens: ['I', "don't", 'know', 'where', 'it', 'is'], ending: '.' });
  });

  it('takes phrases and word examples of 3–9 words, with a translation', () => {
    const pool = sentencePool([
      v('p1', 'I was hungry.', 'Я была голодная.'),
      v('p2', 'Turn left.', 'Поверните налево.'), // too short
      v('w1', 'chair', 'стул', { example: 'There is a chair.', exampleTranslation: 'Есть стул.' }),
      v('w2', 'sofa', 'диван', { example: 'The sofa is here.' }), // no translation
    ]);
    expect(pool.map((s) => [s.english, s.translation])).toEqual([
      ['I was hungry.', 'Я была голодная.'],
      ['There is a chair.', 'Есть стул.'],
    ]);
  });

  it('checks the order case-insensitively', () => {
    expect(isSentenceCorrect(['why', 'were', 'you', 'late'], ['Why', 'were', 'you', 'late'])).toBe(true);
    expect(isSentenceCorrect(['were', 'why', 'you', 'late'], ['Why', 'were', 'you', 'late'])).toBe(false);
  });

  it('never hands out the tokens already in the right order', () => {
    const tokens = ['I', 'was', 'hungry'];
    for (let i = 0; i < 20; i++) {
      expect(shuffleTokens(tokens, () => 0.99).join(' ')).not.toBe('I was hungry');
    }
  });
});

describe('Буквы', () => {
  it('uses only plain English words of 3–14 letters', () => {
    const pool = letterWords([v('1', 'living room', 'гостиная'), v('2', 'I', 'я'), v('3', "don't", 'не'), v('4', '100', 'сто'), v('5', 'TV', 'телевизор')]);
    expect(pool.map((w) => w.english)).toEqual(['living room', "don't"]);
  });

  it('masks unguessed letters but shows spaces and punctuation', () => {
    expect(maskWord('living room', new Set(['i', 'o']))).toBe('_ i _ i _ _   _ o o _');
    expect(maskWord("don't", new Set())).toBe("_ _ _ ' _");
    expect(isWordSolved('Sofa', new Set(['s', 'o', 'f', 'a']))).toBe(true);
    expect(isWordSolved('sofa', new Set(['s', 'o']))).toBe(false);
    expect(LETTER_LIVES).toBe(6);
  });
});

describe('На время', () => {
  it('builds a question with the right translation among 4 distinct options', () => {
    const items = ['a', 'b', 'c', 'd', 'e'].map((e, i) => v(e, e, `ru-${i}`));
    const q = timedQuestion(items, () => 0.5)!;
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.options).toContain(q.target.translation);
  });

  it('needs at least 2 words', () => {
    expect(timedQuestion([v('a', 'a', 'а')])).toBeNull();
  });
});
