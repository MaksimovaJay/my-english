import { ReviewState, ReviewStatus } from '@/types/models';
import { toISODate, addDays } from './date';

export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export type ReviewOutcome = 'again' | 'hard' | 'know';

export function createInitialReviewState(today: Date = new Date()): ReviewState {
  return {
    status: 'new',
    level: 0,
    lastReviewed: null,
    nextReviewDate: toISODate(today),
    correctCount: 0,
    mistakeCount: 0,
  };
}

export function updateReviewState(state: ReviewState, outcome: ReviewOutcome, today: Date = new Date()): ReviewState {
  let level = state.level;
  if (outcome === 'again') level = Math.max(0, level - 2);
  else if (outcome === 'know') level = Math.min(5, level + 1);

  const status: ReviewStatus = level >= 5 ? 'known' : outcome === 'again' ? 'learning' : 'review';

  return {
    status,
    level,
    lastReviewed: toISODate(today),
    nextReviewDate: toISODate(addDays(today, REVIEW_INTERVALS_DAYS[level])),
    correctCount: state.correctCount + (outcome === 'know' ? 1 : 0),
    mistakeCount: state.mistakeCount + (outcome === 'again' ? 1 : 0),
  };
}
