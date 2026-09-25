import { describe, it, expect } from 'vitest';
import { emptyReview, withVerdict, withItemComment, withOverallComment, isReviewed, itemReview, teacherLink } from './homeworkReview';

const T = '2026-09-26T10:00:00.000Z';

describe('homework review', () => {
  it('starts empty and records verdicts and comments per item', () => {
    let r = emptyReview('hw1');
    expect(isReviewed(r)).toBe(false);
    r = withVerdict(r, 'ex1', 1, 'correct', T);
    r = withItemComment(r, 'ex1', 1, 'Хорошо!', T);
    expect(itemReview(r, 'ex1', 1)).toEqual({ verdict: 'correct', comment: 'Хорошо!' });
    expect(itemReview(r, 'ex1', 0)).toEqual({ verdict: null, comment: '' });
    expect(r.updatedAt).toBe(T);
    expect(isReviewed(r)).toBe(true);
  });

  it('toggles a verdict off when the same one is set again', () => {
    let r = withVerdict(emptyReview('hw1'), 'ex1', 0, 'incorrect', T);
    r = withVerdict(r, 'ex1', 0, 'incorrect', T);
    expect(itemReview(r, 'ex1', 0).verdict).toBeNull();
  });

  it('counts an overall comment as a review', () => {
    expect(isReviewed(withOverallComment(emptyReview('hw1'), 'Молодец', T))).toBe(true);
    expect(isReviewed(withOverallComment(emptyReview('hw1'), '   ', T))).toBe(false);
    expect(isReviewed(undefined)).toBe(false);
  });

  it('builds the teacher link', () => {
    expect(teacherLink('https://x.vercel.app', 'hw1')).toBe('https://x.vercel.app/homework/hw1?teacher=1');
  });
});
