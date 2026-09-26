import { describe, it, expect } from 'vitest';
import { buildPlan, isPlanDone, wordOfDay, PLAN_GAME_TARGET, PLAN_REVIEW_MAX } from './plan';
import { createInitialReviewState } from './review';
import { Homework, VocabItem } from '@/types/models';

const TODAY = '2026-09-26';
const daily = (reviewed = 0, gameCorrect = 0, dueAtStart: number | null = null) => ({ date: TODAY, reviewed, gameCorrect, dueAtStart });
const hw = (patch: Partial<Homework>): Homework => ({ id: 'h1', number: 2, title: 'Unit 12', assignedDate: TODAY, status: 'not-started', exercises: [], progress: {}, ...patch });

describe('buildPlan', () => {
  it('asks for up to 10 due cards, 10 game answers and the open homework', () => {
    const plan = buildPlan({ daily: daily(3, 4, 25), dueNow: 22, homeworks: [hw({})], today: TODAY });
    expect(plan.map((t) => [t.id, t.progress, t.done])).toEqual([
      ['review', `3 / ${PLAN_REVIEW_MAX}`, false],
      ['games', `4 / ${PLAN_GAME_TARGET}`, false],
      ['homework', 'ДЗ 2', false],
    ]);
    expect(plan[2].href).toBe('/homework/h1');
  });

  it('uses the due count at the start of the day, so answering cards does not shrink the goal', () => {
    const plan = buildPlan({ daily: daily(4, 0, 4), dueNow: 0, homeworks: [], today: TODAY });
    expect(plan[0]).toMatchObject({ progress: '4 / 4', done: true });
  });

  it('skips cards when nothing is due and homework when there is none', () => {
    const plan = buildPlan({ daily: daily(0, 10, 0), dueNow: 0, homeworks: [], today: TODAY });
    expect(plan.map((t) => t.id)).toEqual(['games']);
    expect(isPlanDone(plan)).toBe(true);
  });

  it('counts homework completed today as done', () => {
    const plan = buildPlan({ daily: daily(), dueNow: 0, homeworks: [hw({ status: 'completed', completedDate: TODAY })], today: TODAY });
    expect(plan.find((t) => t.id === 'homework')).toMatchObject({ done: true });
  });

  it('ignores progress saved on another day', () => {
    const plan = buildPlan({ daily: { date: '2026-09-25', reviewed: 10, gameCorrect: 10, dueAtStart: 10 }, dueNow: 5, homeworks: [], today: TODAY });
    expect(plan.map((t) => t.done)).toEqual([false, false]);
  });
});

describe('wordOfDay', () => {
  const w = (id: string, status: VocabItem['review']['status'] = 'new'): VocabItem => ({
    id, english: id, translation: id, category: 'x', tags: [], dateAdded: TODAY, review: { ...createInitialReviewState(), status },
  });

  it('is the same all day regardless of order, and prefers words not yet known', () => {
    const words = [w('a', 'known'), w('b'), w('c'), w('d')];
    const pick = wordOfDay(words, TODAY)!;
    expect(wordOfDay([...words].reverse(), TODAY)!.id).toBe(pick.id);
    expect(pick.id).not.toBe('a');
  });

  it('changes from day to day', () => {
    const words = 'abcdefghij'.split('').map((id) => w(id));
    const picks = new Set(['2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29'].map((d) => wordOfDay(words, d)!.id));
    expect(picks.size).toBeGreaterThan(1);
  });
});
