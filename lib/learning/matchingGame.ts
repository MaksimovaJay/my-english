function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildMatchingRound<T extends { id: string }>(
  pool: T[],
  count: number,
  random: () => number = Math.random
): { leftItems: T[]; rightItems: T[] } {
  const leftItems = shuffled(pool, random).slice(0, Math.min(count, pool.length));
  const rightItems = shuffled(leftItems, random);
  return { leftItems, rightItems };
}

export function isMatch<T extends { id: string }>(left: T, right: T): boolean {
  return left.id === right.id;
}
