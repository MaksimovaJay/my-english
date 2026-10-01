import { describe, it, expect } from 'vitest';
import { practiceWeight, pickWeighted, weightedSample } from './weighting';
import { createInitialReviewState } from './review';
import { getMistakeSorted } from './reviewQueue';

const item = (id: string, patch: Partial<ReturnType<typeof createInitialReviewState>> = {}) => ({ id, review: { ...createInitialReviewState(), ...patch } });

describe('practiceWeight', () => {
  it('favours «забываю» words, then words with mistakes', () => {
    expect(practiceWeight(item('a', { forgetting: true }))).toBe(3);
    expect(practiceWeight(item('b', { mistakeCount: 2, status: 'learning' }))).toBe(2);
    expect(practiceWeight(item('c', { mistakeCount: 2, status: 'known' }))).toBe(1);
    expect(practiceWeight(item('d'))).toBe(1);
  });
});

describe('pickWeighted', () => {
  it('equals a plain random pick when weights are equal', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(pickWeighted(items, () => 1, () => 0.6)).toBe(items[Math.floor(0.6 * 4)]);
  });

  it('picks heavier items more often', () => {
    const items = [item('plain'), item('shaky', { forgetting: true })];
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let shaky = 0;
    for (let i = 0; i < 4000; i++) if (pickWeighted(items, practiceWeight, random)!.id === 'shaky') shaky++;
    expect(shaky / 4000).toBeGreaterThan(0.68);
    expect(shaky / 4000).toBeLessThan(0.82);
  });

  it('weightedSample returns distinct items', () => {
    const s = weightedSample(['a', 'b', 'c'], 5, () => 1, () => 0.5);
    expect([...s].sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('«Мои ошибки»', () => {
  it('also lists «забываю» words', () => {
    const list = getMistakeSorted([item('ok'), item('shaky', { forgetting: true }), item('wrong', { mistakeCount: 3 })]);
    expect(list.map((i) => i.id)).toEqual(['wrong', 'shaky']);
  });
});
