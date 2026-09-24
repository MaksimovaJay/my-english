import { describe, it, expect } from 'vitest';
import { diffTyped } from './typingCheck';

describe('diffTyped', () => {
  it('marks each character correct or incorrect against the target word', () => {
    expect(diffTyped('mother', 'mother')).toEqual([
      { char: 'm', correct: true }, { char: 'o', correct: true }, { char: 't', correct: true },
      { char: 'h', correct: true }, { char: 'e', correct: true }, { char: 'r', correct: true },
    ]);
  });

  it('flags mismatched characters', () => {
    expect(diffTyped('mothar', 'mother')).toEqual([
      { char: 'm', correct: true }, { char: 'o', correct: true }, { char: 't', correct: true },
      { char: 'h', correct: true }, { char: 'a', correct: false }, { char: 'r', correct: true },
    ]);
  });

  it('is case-insensitive', () => {
    expect(diffTyped('MOTHER', 'mother').every((c) => c.correct)).toBe(true);
  });
});
