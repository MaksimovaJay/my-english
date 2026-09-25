export interface FloatingWordsConfig { poolSize: number; speedSeconds: number; }

export const DIFFICULTY_CONFIG: Record<'easy' | 'medium' | 'hard', FloatingWordsConfig> = {
  easy: { poolSize: 4, speedSeconds: 18 },
  medium: { poolSize: 7, speedSeconds: 12 },
  hard: { poolSize: 10, speedSeconds: 7 },
};

function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickFloatingRound<T extends { id: string }>(
  pool: T[],
  poolSize: number,
  random: () => number = Math.random
): { target: T; bubbles: T[] } | null {
  if (pool.length === 0) return null;
  const bubbles = shuffled(pool, random).slice(0, Math.min(poolSize, pool.length));
  const target = bubbles[Math.floor(random() * bubbles.length)];
  return { target, bubbles };
}

/** Vertical space per bubble: bubble height (~32px) plus room for the float animation. */
export const BUBBLE_ROW_PX = 48;

/** One row per bubble (so they never overlap), staggered horizontally so the field looks scattered. */
export function bubbleLayout(index: number, count: number): { topPx: number; leftPct: number } {
  const stagger = [4, 38, 16, 50, 26, 8, 44, 20, 32, 12];
  void count;
  return { topPx: 12 + index * BUBBLE_ROW_PX, leftPct: stagger[index % stagger.length] };
}

export function floatingAreaHeightPx(count: number): number {
  return Math.max(256, 24 + count * BUBBLE_ROW_PX);
}
