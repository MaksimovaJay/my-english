import { Homework, VocabItem } from '@/types/models';
import { DailyProgress } from '@/lib/storage/settingsStore';

export const PLAN_REVIEW_MAX = 10;
export const PLAN_GAME_TARGET = 10;

export interface PlanTask {
  id: 'review' | 'games' | 'homework';
  label: string;
  progress: string;
  done: boolean;
  href: string;
}

interface PlanInput {
  daily: DailyProgress | null;
  dueNow: number;
  homeworks: Homework[];
  today: string; // YYYY-MM-DD
}

/** Today's plan: a few due cards, some right answers in games, and the open homework if there is one. */
export function buildPlan({ daily, dueNow, homeworks, today }: PlanInput): PlanTask[] {
  const d = daily?.date === today ? daily : { reviewed: 0, gameCorrect: 0, dueAtStart: null };
  const tasks: PlanTask[] = [];

  // The goal is fixed by what was due when the day started; answering cards must not shrink it.
  const reviewTarget = Math.min(PLAN_REVIEW_MAX, d.dueAtStart ?? dueNow);
  if (reviewTarget > 0) {
    tasks.push({
      id: 'review',
      label: 'Повторить карточки',
      progress: `${Math.min(d.reviewed, reviewTarget)} / ${reviewTarget}`,
      done: d.reviewed >= reviewTarget,
      href: '/review',
    });
  }

  tasks.push({
    id: 'games',
    label: 'Правильные ответы в играх',
    progress: `${Math.min(d.gameCorrect, PLAN_GAME_TARGET)} / ${PLAN_GAME_TARGET}`,
    done: d.gameCorrect >= PLAN_GAME_TARGET,
    href: '/games',
  });

  const open = homeworks.find((h) => h.status !== 'completed');
  const doneToday = homeworks.find((h) => h.status === 'completed' && h.completedDate === today);
  const hw = open ?? doneToday;
  if (hw) {
    tasks.push({ id: 'homework', label: `Домашка: ${hw.title}`, progress: hw.number ? `ДЗ ${hw.number}` : 'ДЗ', done: hw === doneToday, href: `/homework/${hw.id}` });
  }

  return tasks;
}

export function isPlanDone(tasks: PlanTask[]): boolean {
  return tasks.length > 0 && tasks.every((t) => t.done);
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The same word all day on every device (independent of list order); prefers words not learned yet. */
export function wordOfDay(words: VocabItem[], today: string): VocabItem | null {
  const unlearned = words.filter((w) => w.review.status !== 'known');
  const pool = (unlearned.length > 0 ? unlearned : words).slice().sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return null;
  return pool[hash(today) % pool.length];
}
