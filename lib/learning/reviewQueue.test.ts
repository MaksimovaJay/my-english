import { describe, it, expect } from 'vitest';
import { getDueItems, getMistakeSorted } from './reviewQueue';
import { ReviewState } from '@/types/models';

function item(id: string, review: Partial<ReviewState>) {
  return { id, review: { status: 'review' as const, level: 1, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...review } };
}

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('getDueItems', () => {
  it('includes items due today or overdue, excludes future and null dates', () => {
    const items = [
      item('past', { nextReviewDate: '2026-09-20' }),
      item('today', { nextReviewDate: '2026-09-24' }),
      item('future', { nextReviewDate: '2026-10-01' }),
      item('none', { nextReviewDate: null }),
    ];
    const due = getDueItems(items, TODAY).map((i) => i.id);
    expect(due).toEqual(['past', 'today']);
  });
});

describe('getMistakeSorted', () => {
  it('excludes items with no mistakes and sorts the rest descending', () => {
    const items = [item('a', { mistakeCount: 1 }), item('b', { mistakeCount: 0 }), item('c', { mistakeCount: 5 })];
    expect(getMistakeSorted(items).map((i) => i.id)).toEqual(['c', 'a']);
  });
});
