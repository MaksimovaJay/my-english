import { HomeworkReview, Verdict } from '@/types/models';

export function emptyReview(homeworkId: string): HomeworkReview {
  return { id: homeworkId, items: {}, overallComment: '', updatedAt: '' };
}

export function itemReview(review: HomeworkReview | undefined, exerciseId: string, itemIndex: number): { verdict: Verdict; comment: string } {
  const entry = review?.items[exerciseId];
  return { verdict: entry?.verdict[itemIndex] ?? null, comment: entry?.comment[itemIndex] ?? '' };
}

function setItem(review: HomeworkReview, exerciseId: string, itemIndex: number, patch: { verdict?: Verdict; comment?: string }, now: string): HomeworkReview {
  const entry = review.items[exerciseId] ?? { verdict: [], comment: [] };
  const verdict = [...entry.verdict];
  const comment = [...entry.comment];
  if ('verdict' in patch) verdict[itemIndex] = patch.verdict ?? null;
  if ('comment' in patch) comment[itemIndex] = patch.comment ?? '';
  return { ...review, items: { ...review.items, [exerciseId]: { verdict, comment } }, updatedAt: now };
}

/** Setting the verdict an item already has clears it (the ✔/✘ buttons toggle). */
export function withVerdict(review: HomeworkReview, exerciseId: string, itemIndex: number, verdict: Exclude<Verdict, null>, now = new Date().toISOString()): HomeworkReview {
  const current = itemReview(review, exerciseId, itemIndex).verdict;
  return setItem(review, exerciseId, itemIndex, { verdict: current === verdict ? null : verdict }, now);
}

export function withItemComment(review: HomeworkReview, exerciseId: string, itemIndex: number, comment: string, now = new Date().toISOString()): HomeworkReview {
  return setItem(review, exerciseId, itemIndex, { comment }, now);
}

export function withOverallComment(review: HomeworkReview, overallComment: string, now = new Date().toISOString()): HomeworkReview {
  return { ...review, overallComment, updatedAt: now };
}

export function isReviewed(review: HomeworkReview | undefined): boolean {
  if (!review) return false;
  if (review.overallComment.trim()) return true;
  return Object.values(review.items).some((e) => e.verdict.some(Boolean) || e.comment.some((c) => c?.trim()));
}

export function teacherLink(origin: string, homeworkId: string): string {
  return `${origin}/homework/${homeworkId}?teacher=1`;
}
