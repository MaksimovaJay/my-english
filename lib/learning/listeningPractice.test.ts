import { describe, it, expect } from 'vitest';
import { buildListeningRound } from './listeningPractice';

interface Item { id: string; english: string; category: string; }

const pool: Item[] = [
  { id: '1', english: 'mother', category: 'Family' },
  { id: '2', english: 'father', category: 'Family' },
  { id: '3', english: 'chair', category: 'Home' },
  { id: '4', english: 'table', category: 'Home' },
];

describe('buildListeningRound', () => {
  it('returns null for an empty pool', () => {
    expect(buildListeningRound([], () => 0)).toBeNull();
  });

  it('returns a target and up to 3 unique options including the target', () => {
    const round = buildListeningRound(pool, () => 0);
    expect(round).not.toBeNull();
    expect(round!.options).toHaveLength(3);
    expect(round!.options.map((o) => o.id)).toContain(round!.target.id);
    const uniqueIds = new Set(round!.options.map((o) => o.id));
    expect(uniqueIds.size).toBe(3);
  });

  it('prefers same-category distractors when available', () => {
    const round = buildListeningRound(pool, () => 0);
    const distractorCategories = round!.options.filter((o) => o.id !== round!.target.id).map((o) => o.category);
    expect(distractorCategories).toContain(round!.target.category);
  });

  it('does not crash and returns as many distractors as available when pool size is below 3', () => {
    const smallPool = pool.slice(0, 2);
    const round = buildListeningRound(smallPool, () => 0);
    expect(round).not.toBeNull();
    expect(round!.options).toHaveLength(2);
    expect(round!.options.map((o) => o.id)).toContain(round!.target.id);
  });
});
