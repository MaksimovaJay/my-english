import { ReviewState } from '@/types/models';
import { toISODate } from './date';

export function getDueItems<T extends { review: ReviewState }>(items: T[], today: Date = new Date()): T[] {
  const todayStr = toISODate(today);
  return items.filter((i) => i.review.nextReviewDate !== null && i.review.nextReviewDate <= todayStr);
}

export function getMistakeSorted<T extends { review: ReviewState }>(items: T[]): T[] {
  return [...items].filter((i) => i.review.mistakeCount > 0).sort((a, b) => b.review.mistakeCount - a.review.mistakeCount);
}
