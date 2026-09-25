import { describe, it, expect } from 'vitest';
import { pickFloatingRound, DIFFICULTY_CONFIG } from './floatingWords';

interface Item { id: string; english: string; }
const pool: Item[] = [{ id: '1', english: 'mother' }, { id: '2', english: 'chair' }, { id: '3', english: 'table' }, { id: '4', english: 'fridge' }];

describe('pickFloatingRound', () => {
  it('returns null for an empty pool', () => {
    expect(pickFloatingRound([], 4, () => 0)).toBeNull();
  });

  it('caps bubbles at poolSize and never exceeds the pool length', () => {
    const round = pickFloatingRound(pool, 2, () => 0);
    expect(round!.bubbles).toHaveLength(2);
    const round2 = pickFloatingRound(pool, 10, () => 0);
    expect(round2!.bubbles).toHaveLength(4);
  });

  it('always picks the target from among the bubbles', () => {
    const round = pickFloatingRound(pool, 4, () => 0.5);
    expect(round!.bubbles.map((b) => b.id)).toContain(round!.target.id);
  });

  it('defines easy/medium/hard difficulty configs', () => {
    expect(DIFFICULTY_CONFIG.easy.poolSize).toBeLessThan(DIFFICULTY_CONFIG.hard.poolSize);
    expect(DIFFICULTY_CONFIG.easy.speedSeconds).toBeGreaterThan(DIFFICULTY_CONFIG.hard.speedSeconds);
  });
});
