import { ReviewState } from '@/types/models';
import { toISODate } from './date';

export interface ProgressStats {
  total: number;
  learned: number;
  learning: number;
  needsReview: number;
  accuracy: number;
}

export function computeProgressStats<T extends { review: ReviewState }>(items: T[], today: Date = new Date()): ProgressStats {
  const total = items.length;
  const learned = items.filter((i) => i.review.status === 'known').length;
  const learning = items.filter((i) => i.review.status === 'new' || i.review.status === 'learning').length;
  const todayStr = toISODate(today);
  const needsReview = items.filter((i) => i.review.nextReviewDate !== null && i.review.nextReviewDate <= todayStr).length;
  const totalCorrect = items.reduce((sum, i) => sum + i.review.correctCount, 0);
  const totalAnswers = items.reduce((sum, i) => sum + i.review.correctCount + i.review.mistakeCount, 0);
  const accuracy = totalAnswers === 0 ? 0 : Math.round((totalCorrect / totalAnswers) * 100);
  return { total, learned, learning, needsReview, accuracy };
}
