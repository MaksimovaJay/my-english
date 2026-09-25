import { describe, it, expect } from 'vitest';
import { computeProgressStats } from './progressStats';
import { ReviewState } from '@/types/models';

function item(review: Partial<ReviewState>) {
  return { review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...review } };
}

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('computeProgressStats', () => {
  it('counts total, learned, learning and needsReview', () => {
    const items = [
      item({ status: 'known' }),
      item({ status: 'new' }),
      item({ status: 'learning' }),
      item({ status: 'review', nextReviewDate: '2026-09-20' }),
    ];
    const stats = computeProgressStats(items, TODAY);
    expect(stats.total).toBe(4);
    expect(stats.learned).toBe(1);
    expect(stats.learning).toBe(2);
    expect(stats.needsReview).toBe(1);
  });

  it('computes accuracy as correct / (correct + mistakes), rounded, 0 when no answers yet', () => {
    expect(computeProgressStats([item({ correctCount: 4, mistakeCount: 1 })], TODAY).accuracy).toBe(80);
    expect(computeProgressStats([item({})], TODAY).accuracy).toBe(0);
  });
});
