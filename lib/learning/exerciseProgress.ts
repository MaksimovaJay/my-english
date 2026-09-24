import { FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from './checkAnswer';

export function initFillBlankAnswers(items: FillBlankItem[]): string[][] {
  return items.map((item) => item.blanks.map(() => ''));
}

export function initMultipleChoiceAnswers(items: MultipleChoiceItem[]): (number | null)[] {
  return items.map(() => null);
}

export function scoreFillBlank(items: FillBlankItem[], answers: string[][]): { correct: number; total: number } {
  const total = items.length;
  const correct = items.filter((item, i) => isFillBlankItemCorrect(item, answers[i] ?? [])).length;
  return { correct, total };
}

export function scoreMultipleChoice(items: MultipleChoiceItem[], answers: (number | null)[]): { correct: number; total: number } {
  const total = items.length;
  const correct = items.filter((item, i) => isMultipleChoiceItemCorrect(item, answers[i] ?? null)).length;
  return { correct, total };
}
