import { Exercise, Homework } from '@/types/models';
import { initHomeworkProgress } from '@/lib/learning/homework';
import { unit11Exercises } from './grammar';

function hw(number: number, title: string, assignedDate: string, exercises: Exercise[], sourceNote?: string): Homework {
  const id = `seed-hw-${number}`;
  const own = exercises.map((ex) => ({ ...ex, id: `${id}-${ex.id}` }));
  return { id, number, title, assignedDate, status: 'not-started', exercises: own, progress: initHomeworkProgress(own), sourceNote };
}

// Added from photos of the book pages the teacher assigns. Seed homework is add-only:
// once on a device, its answers belong to the student and are never overwritten.
export const seedHomeworks: Homework[] = [
  hw(1, 'Unit 11: was / were', '2026-09-25', unit11Exercises, 'Murphy, Essential Grammar in Use, Unit 11 — 11.2, 11.3, 11.4'),
];
