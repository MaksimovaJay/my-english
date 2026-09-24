import { describe, it, expect } from 'vitest';
import { updateReviewState, createInitialReviewState, REVIEW_INTERVALS_DAYS } from './review';

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('createInitialReviewState', () => {
  it('creates a fresh new-status state due today', () => {
    const state = createInitialReviewState(TODAY);
    expect(state).toEqual({
      status: 'new',
      level: 0,
      lastReviewed: null,
      nextReviewDate: '2026-09-24',
      correctCount: 0,
      mistakeCount: 0,
    });
  });
});

describe('updateReviewState', () => {
  it('drops level by 2 (floored at 0) and marks learning on "again"', () => {
    const state = { status: 'review' as const, level: 3, lastReviewed: null, nextReviewDate: null, correctCount: 5, mistakeCount: 1 };
    const next = updateReviewState(state, 'again', TODAY);
    expect(next.level).toBe(1);
    expect(next.status).toBe('learning');
    expect(next.mistakeCount).toBe(2);
    expect(next.nextReviewDate).toBe('2026-09-25'); // level 1 -> +1 day
  });

  it('floors level at 0 on "again"', () => {
    const state = createInitialReviewState(TODAY);
    const next = updateReviewState(state, 'again', TODAY);
    expect(next.level).toBe(0);
    expect(next.nextReviewDate).toBe('2026-09-24'); // level 0 -> +0 days
  });

  it('keeps level unchanged on "hard"', () => {
    const state = { status: 'review' as const, level: 2, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 };
    const next = updateReviewState(state, 'hard', TODAY);
    expect(next.level).toBe(2);
    expect(next.status).toBe('review');
  });

  it('raises level by 1 (capped at 5) and increments correctCount on "know"', () => {
    const state = { status: 'review' as const, level: 4, lastReviewed: null, nextReviewDate: null, correctCount: 2, mistakeCount: 0 };
    const next = updateReviewState(state, 'know', TODAY);
    expect(next.level).toBe(5);
    expect(next.status).toBe('known');
    expect(next.correctCount).toBe(3);
    expect(next.nextReviewDate).toBe('2026-10-24'); // level 5 -> +30 days
  });

  it('does not exceed level 5', () => {
    const state = { status: 'known' as const, level: 5, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 };
    const next = updateReviewState(state, 'know', TODAY);
    expect(next.level).toBe(5);
  });

  it('uses REVIEW_INTERVALS_DAYS = [0,1,3,7,14,30]', () => {
    expect(REVIEW_INTERVALS_DAYS).toEqual([0, 1, 3, 7, 14, 30]);
  });
});
