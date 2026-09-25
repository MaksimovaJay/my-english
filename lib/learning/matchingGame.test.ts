import { describe, it, expect } from 'vitest';
import { buildMatchingRound, isMatch } from './matchingGame';

interface Item { id: string; english: string; translation: string; }
const pool: Item[] = [
  { id: '1', english: 'mother', translation: 'мама' },
  { id: '2', english: 'chair', translation: 'стул' },
  { id: '3', english: 'table', translation: 'стол' },
];

describe('buildMatchingRound', () => {
  it('caps leftItems at count and never exceeds the pool length', () => {
    expect(buildMatchingRound(pool, 2, () => 0).leftItems).toHaveLength(2);
    expect(buildMatchingRound(pool, 10, () => 0).leftItems).toHaveLength(3);
  });

  it('rightItems is a permutation of the same ids as leftItems', () => {
    const { leftItems, rightItems } = buildMatchingRound(pool, 3, () => 0.7);
    expect(new Set(rightItems.map((i) => i.id))).toEqual(new Set(leftItems.map((i) => i.id)));
  });
});

describe('isMatch', () => {
  it('is true only when ids are equal', () => {
    expect(isMatch(pool[0], pool[0])).toBe(true);
    expect(isMatch(pool[0], pool[1])).toBe(false);
  });
});
