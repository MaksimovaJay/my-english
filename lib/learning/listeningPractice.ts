function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildListeningRound<T extends { id: string; english: string; category: string }>(
  pool: T[],
  random: () => number = Math.random
): { target: T; options: T[] } | null {
  if (pool.length === 0) return null;
  const shuffledPool = shuffled(pool, random);
  const target = shuffledPool[0];
  const rest = shuffledPool.slice(1);
  const sameCategory = rest.filter((w) => w.category === target.category);
  const otherCategory = rest.filter((w) => w.category !== target.category);
  const distractors = [...sameCategory, ...otherCategory].slice(0, 2);
  const options = shuffled([target, ...distractors], random);
  return { target, options };
}
