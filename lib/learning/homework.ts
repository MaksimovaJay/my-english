import { Exercise, ExerciseProgress, FillBlankItem, Homework, MultipleChoiceItem } from '@/types/models';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from './exerciseProgress';
import { generateId } from '@/lib/utils';

export function initHomeworkProgress(exercises: Exercise[]): Record<string, ExerciseProgress> {
  const progress: Record<string, ExerciseProgress> = {};
  for (const ex of exercises) {
    const count = ex.items.length;
    progress[ex.id] = {
      userAnswers: ex.type === 'free-text'
        ? ex.items.map(() => [''])
        : ex.type === 'fill-blank'
          ? initFillBlankAnswers(ex.items as FillBlankItem[])
          : initMultipleChoiceAnswers(ex.items as MultipleChoiceItem[]),
      checked: Array(count).fill(false),
      correct: Array(count).fill(false),
    };
  }
  return progress;
}

export function computeHomeworkScore(homework: Homework): { correct: number; total: number } {
  let correct = 0;
  let total = 0;
  for (const ex of homework.exercises) {
    const progress = homework.progress[ex.id];
    // Free-text answers have no answer key: the teacher checks them.
    if (!progress || ex.type === 'free-text') continue;
    const score = ex.type === 'fill-blank'
      ? scoreFillBlank(ex.items as FillBlankItem[], progress.userAnswers as string[][])
      : scoreMultipleChoice(ex.items as MultipleChoiceItem[], progress.userAnswers as (number | null)[]);
    correct += score.correct;
    total += score.total;
  }
  return { correct, total };
}

export function homeworkProgressFraction(homework: Homework): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const ex of homework.exercises) {
    total += ex.items.length;
    const progress = homework.progress[ex.id];
    if (progress) done += progress.checked.filter(Boolean).length;
  }
  return { done, total };
}

export function parseHomeworkImport(raw: string): Homework {
  const data = JSON.parse(raw);
  if (!data.title || !Array.isArray(data.exercises) || data.exercises.length === 0) {
    throw new Error('Invalid homework file: expected { title, exercises: [...] } with at least one exercise.');
  }
  for (const ex of data.exercises) {
    if (ex.type !== 'fill-blank' && ex.type !== 'multiple-choice' && ex.type !== 'free-text') {
      throw new Error(`Unsupported exercise type "${ex.type}". Only "fill-blank", "multiple-choice" and "free-text" are supported.`);
    }
    if (!Array.isArray(ex.items) || ex.items.length === 0) {
      throw new Error(`Exercise "${ex.instruction ?? '(untitled)'}" has no items.`);
    }
    if (ex.type === 'fill-blank') {
      for (const item of ex.items) {
        const blankCount = typeof item.text === 'string' ? (item.text.match(/___/g) ?? []).length : 0;
        if (blankCount === 0 || !Array.isArray(item.blanks) || item.blanks.length !== blankCount) {
          throw new Error(`Fill-blank item "${item.text ?? '(missing text)'}" has a mismatched number of ___ markers and accepted-answer blanks.`);
        }
      }
    } else if (ex.type === 'multiple-choice') {
      for (const item of ex.items) {
        if (!Array.isArray(item.options) || item.options.length < 2 || typeof item.correctIndex !== 'number' || item.correctIndex < 0 || item.correctIndex >= item.options.length) {
          throw new Error(`Multiple-choice item "${item.question ?? '(missing question)'}" has invalid options/correctIndex.`);
        }
      }
    }
  }
  const exercises: Exercise[] = data.exercises.map((ex: any) => ({
    id: ex.id ?? generateId(),
    type: ex.type,
    instruction: ex.instruction,
    items: ex.items,
    explanation: ex.explanation,
    relatedGrammarTopicId: ex.relatedGrammarTopicId,
  }));
  return {
    id: data.id ?? generateId(),
    title: data.title,
    assignedDate: data.assignedDate ?? new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate,
    status: 'not-started',
    exercises,
    progress: initHomeworkProgress(exercises),
    sourceNote: data.sourceNote,
  };
}

/** 'ДЗ 1 · Unit 11: was / were', or just the title for homework without a number. */
export function homeworkLabel(homework: Pick<Homework, 'number' | 'title'>): string {
  return homework.number ? `ДЗ ${homework.number} · ${homework.title}` : homework.title;
}

export function nextHomeworkNumber(homeworks: Pick<Homework, 'number'>[]): number {
  return Math.max(0, ...homeworks.map((h) => h.number ?? 0)) + 1;
}

export interface AssignHomeworkInput {
  bookNumbers: string[];
  teacherNotes: string;
  images: string[];
  assignedDate: string;
  dueDate: string;
}

/** A homework recorded from the form: one free-text exercise per book exercise number. */
export function buildAssignedHomework(input: AssignHomeworkInput, number: number): Homework {
  const numbers = input.bookNumbers.map((n) => n.trim()).filter(Boolean);
  if (numbers.length === 0) throw new Error('Добавьте хотя бы один номер из книги.');
  const id = generateId();
  const exercises: Exercise[] = numbers.map((n, i) => ({
    id: `${id}-ex${i + 1}`,
    type: 'free-text',
    instruction: `Упражнение ${n}`,
    items: [{ prompt: '' }],
  }));
  return {
    id,
    number,
    title: `Упражнения ${numbers.join(', ')}`,
    assignedDate: input.assignedDate,
    dueDate: input.dueDate || undefined,
    status: 'not-started',
    exercises,
    progress: initHomeworkProgress(exercises),
    teacherNotes: input.teacherNotes.trim() || undefined,
    images: input.images.length > 0 ? input.images : undefined,
  };
}

export function withFreeTextAnswer(homework: Homework, exerciseId: string, itemIndex: number, text: string): Homework {
  const progress = homework.progress[exerciseId];
  const userAnswers = progress.userAnswers.map((a, i) => (i === itemIndex ? [text] : a));
  const checked = progress.checked.map((c, i) => (i === itemIndex ? text.trim() !== '' : c));
  return {
    ...homework,
    status: homework.status === 'not-started' ? 'in-progress' : homework.status,
    progress: { ...homework.progress, [exerciseId]: { ...progress, userAnswers, checked } },
  };
}
