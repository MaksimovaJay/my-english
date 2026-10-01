import { ReviewState } from '@/types/models';

/** How much more often a word should come up in games and practice. */
export function practiceWeight(item: { review: ReviewState }): number {
  if (item.review.forgetting) return 3; // «Знаю, но забываю»
  if (item.review.mistakeCount > 0 && item.review.status !== 'known') return 2; // had mistakes, not learned yet
  return 1;
}

/** One item, chosen with probability proportional to its weight. With equal weights it is items[floor(random * n)]. */
export function pickWeighted<T>(items: T[], weight: (item: T) => number, random: () => number = Math.random): T | undefined {
  if (items.length === 0) return undefined;
  const weights = items.map(weight);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}

/** `count` distinct items, heavier ones more likely to be included. */
export function weightedSample<T>(items: T[], count: number, weight: (item: T) => number, random: () => number = Math.random): T[] {
  const left = [...items];
  const out: T[] = [];
  while (out.length < count && left.length > 0) {
    const picked = pickWeighted(left, weight, random)!;
    out.push(picked);
    left.splice(left.indexOf(picked), 1);
  }
  return out;
}
