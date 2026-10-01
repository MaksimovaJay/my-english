import { Exercise, ExerciseProgress, FillBlankItem, Homework, MultipleChoiceItem, SentenceOrderItem } from '@/types/models';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank } from './exerciseProgress';
import { generateId } from '@/lib/utils';
import { parseSentenceLines, sentenceChips } from './sentenceOrder';
import { isSentenceCorrect } from './games';

export function initHomeworkProgress(exercises: Exercise[]): Record<string, ExerciseProgress> {
  const progress: Record<string, ExerciseProgress> = {};
  for (const ex of exercises) {
    const count = ex.items.length;
    progress[ex.id] = {
      userAnswers: ex.type === 'free-text'
        ? ex.items.map(() => [''])
        : ex.type === 'sentence-order'
        ? ex.items.map(() => [])
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
    // Multiple choice and sentence order may be retried until right, so they score the first try (progress.correct).
    const score = ex.type === 'fill-blank'
      ? scoreFillBlank(ex.items as FillBlankItem[], progress.userAnswers as string[][])
      : { correct: progress.correct.filter(Boolean).length, total: ex.items.length };
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
    if (!['fill-blank', 'multiple-choice', 'free-text', 'sentence-order'].includes(ex.type)) {
      throw new Error(`Unsupported exercise type "${ex.type}". Only "fill-blank", "multiple-choice", "free-text" and "sentence-order" are supported.`);
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
  /** «Собери предложение»: one sentence per line, optional «= перевод». */
  sentences?: string;
}

/** A homework recorded from the form: one free-text exercise per book exercise number. */
export function buildAssignedHomework(input: AssignHomeworkInput, number: number): Homework {
  const numbers = input.bookNumbers.map((n) => n.trim()).filter(Boolean);
  const sentences = parseSentenceLines(input.sentences ?? '');
  if (numbers.length === 0 && sentences.length === 0) throw new Error('Добавьте номер из книги или предложения для игры.');
  const id = generateId();
  const exercises: Exercise[] = numbers.map((n, i) => ({
    id: `${id}-ex${i + 1}`,
    type: 'free-text',
    instruction: `Упражнение ${n}`,
    items: [{ prompt: '' }],
  }));
  if (sentences.length > 0) {
    exercises.push({ id: `${id}-sentences`, type: 'sentence-order', instruction: '🧩 Соберите предложения из слов', items: sentences });
  }
  return {
    id,
    number,
    title: numbers.length === 0 ? '🧩 Собери предложение' : `Упражнения ${numbers.join(', ')}${sentences.length ? ' + 🧩' : ''}`,
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

const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function weekLabel(monday: Date): string {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  return sameMonth
    ? `Неделя ${monday.getDate()}–${sunday.getDate()} ${MONTHS_GENITIVE[sunday.getMonth()]}`
    : `Неделя ${monday.getDate()} ${MONTHS_GENITIVE[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS_GENITIVE[sunday.getMonth()]}`;
}

/** Homework grouped by Monday–Sunday week of assignedDate; newest week first, newest homework first within a week. */
export function groupHomeworkByWeek<T extends Pick<Homework, 'assignedDate'>>(homeworks: T[]): { label: string; items: T[] }[] {
  const groups = new Map<string, { monday: Date; items: T[] }>();
  for (const hw of homeworks) {
    const date = parseISODate(hw.assignedDate);
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
    const key = monday.toDateString();
    if (!groups.has(key)) groups.set(key, { monday, items: [] });
    groups.get(key)!.items.push(hw);
  }
  return [...groups.values()]
    .sort((a, b) => b.monday.getTime() - a.monday.getTime())
    .map(({ monday, items }) => ({
      label: weekLabel(monday),
      items: [...items].sort((a, b) => b.assignedDate.localeCompare(a.assignedDate)),
    }));
}

/** Items answered wrong in any homework (fill-blank and multiple choice), as small exercises to redo in review. */
export function homeworkMistakes(homeworks: Homework[]): Exercise[] {
  return homeworks.flatMap((hw) =>
    hw.exercises.flatMap((ex): Exercise[] => {
      const progress = hw.progress[ex.id];
      if (!progress || (ex.type !== 'fill-blank' && ex.type !== 'multiple-choice')) return [];
      const wrong = ex.items.filter((_, i) => progress.checked[i] && !progress.correct[i]);
      if (wrong.length === 0) return [];
      const prefix = hw.number ? `ДЗ ${hw.number}` : hw.title;
      return [{ id: `mistakes-${hw.id}-${ex.id}`, type: ex.type, instruction: `${prefix} · ${ex.instruction}`, items: wrong as Exercise['items'] }];
    })
  );
}

/**
 * Saves the words placed so far (indices into the shuffled chips). When the sentence is complete for the
 * first time it is checked and that first try is the score; it can still be rearranged until right.
 */
export function withSentenceAnswer(homework: Homework, exerciseId: string, itemIndex: number, placed: string[]): Homework {
  const ex = homework.exercises.find((e) => e.id === exerciseId)!;
  const progress = homework.progress[exerciseId];
  const { chips, tokens } = sentenceChips((ex.items as SentenceOrderItem[])[itemIndex]);
  const userAnswers = progress.userAnswers.map((a, i) => (i === itemIndex ? placed : a));
  let { checked, correct } = progress;
  if (placed.length === chips.length && !checked[itemIndex]) {
    const right = isSentenceCorrect(placed.map((k) => chips[Number(k)]), tokens);
    checked = checked.map((c, i) => (i === itemIndex ? true : c));
    correct = correct.map((c, i) => (i === itemIndex ? right : c));
  }
  return {
    ...homework,
    status: homework.status === 'not-started' ? 'in-progress' : homework.status,
    progress: { ...homework.progress, [exerciseId]: { userAnswers, checked, correct } },
  };
}
