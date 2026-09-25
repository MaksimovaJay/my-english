import { FillBlankItem, MultipleChoiceItem } from '@/types/models';

export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[.?!]+$/, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isAnswerCorrect(userInput: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(userInput);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

export function isFillBlankItemCorrect(item: FillBlankItem, userAnswers: string[]): boolean {
  return item.blanks.every((accepted, i) => isAnswerCorrect(userAnswers[i] ?? '', accepted));
}

export function isMultipleChoiceItemCorrect(item: MultipleChoiceItem, selectedIndex: number | null): boolean {
  return selectedIndex !== null && selectedIndex === item.correctIndex;
}
