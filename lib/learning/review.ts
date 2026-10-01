import { ReviewState, ReviewStatus } from '@/types/models';
import { toISODate, addDays } from './date';

export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

/** «Не знаю» / «Знаю, но забываю» / «Знаю». */
export type ReviewOutcome = 'again' | 'forgetting' | 'know';

/** A word marked «забываю» never climbs past this level until a clean «Знаю». */
const FORGETTING_MAX_LEVEL = 2;

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
  if (outcome === 'forgetting') {
    // Known, but slipping: not a mistake, yet it comes back tomorrow and games show it more often.
    const level = Math.min(state.level, FORGETTING_MAX_LEVEL);
    return {
      ...state,
      status: state.status === 'new' || level === 0 ? 'learning' : 'review',
      level,
      lastReviewed: toISODate(today),
      nextReviewDate: toISODate(addDays(today, 1)),
      correctCount: state.correctCount + 1,
      forgetting: true,
    };
  }

  let level = state.level;
  if (outcome === 'again') level = Math.max(0, level - 2);
  else level = Math.min(5, level + 1);

  const status: ReviewStatus = outcome === 'again' ? 'learning' : level >= 5 ? 'known' : 'review';

  return {
    ...state,
    status,
    level,
    lastReviewed: toISODate(today),
    nextReviewDate: toISODate(addDays(today, REVIEW_INTERVALS_DAYS[level])),
    correctCount: state.correctCount + (outcome === 'know' ? 1 : 0),
    mistakeCount: state.mistakeCount + (outcome === 'again' ? 1 : 0),
    forgetting: outcome === 'know' ? false : state.forgetting,
  };
}
