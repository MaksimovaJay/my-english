import { describe, it, expect } from 'vitest';
import { normalizeAnswer, isAnswerCorrect, isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from './checkAnswer';

describe('normalizeAnswer', () => {
  it('trims, lowercases and collapses whitespace', () => {
    expect(normalizeAnswer('  Was   ')).toBe('was');
    expect(normalizeAnswer('I  am   home')).toBe('i am home');
  });

  it('treats curly and straight apostrophes the same', () => {
    expect(normalizeAnswer('wasn’t')).toBe("wasn't");
  });

  it('ignores trailing sentence punctuation', () => {
    expect(normalizeAnswer('Was your exam difficult?')).toBe('was your exam difficult');
    expect(normalizeAnswer('Was your exam difficult ')).toBe('was your exam difficult');
  });
});

describe('isAnswerCorrect', () => {
  it('matches case-insensitively against any accepted answer', () => {
    expect(isAnswerCorrect('Was', ['was'])).toBe(true);
    expect(isAnswerCorrect('wasn t', ["wasn't", 'was not'])).toBe(false);
    expect(isAnswerCorrect('was not', ["wasn't", 'was not'])).toBe(true);
  });

  it('rejects answers not in the accepted list', () => {
    expect(isAnswerCorrect('were', ['was'])).toBe(false);
  });
});

describe('isFillBlankItemCorrect', () => {
  it('requires every blank to match', () => {
    const item = { text: 'She ___ 22, so she ___ 23 now.', blanks: [['was'], ['is']] };
    expect(isFillBlankItemCorrect(item, ['was', 'is'])).toBe(true);
    expect(isFillBlankItemCorrect(item, ['was', 'are'])).toBe(false);
  });
});

describe('isMultipleChoiceItemCorrect', () => {
  it('compares selected index to correctIndex', () => {
    const item = { question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 };
    expect(isMultipleChoiceItemCorrect(item, 1)).toBe(true);
    expect(isMultipleChoiceItemCorrect(item, 0)).toBe(false);
    expect(isMultipleChoiceItemCorrect(item, null)).toBe(false);
  });
});
