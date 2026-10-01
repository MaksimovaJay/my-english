'use client';

import { FillBlankItem, Homework, MultipleChoiceItem, SentenceOrderItem, WordListItem } from '@/types/models';
import { FillBlankExercise } from '@/components/exercises/FillBlankExercise';
import { MultipleChoiceExercise } from '@/components/exercises/MultipleChoiceExercise';
import { SentenceOrderExercise } from '@/components/exercises/SentenceOrderExercise';
import { WordBankExercise } from '@/components/exercises/WordBankExercise';
import { HomeworkWords } from './HomeworkWords';
import { withFreeTextAnswer, withSentenceAnswer, withWordBankAnswer } from '@/lib/learning/homework';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from '@/lib/learning/checkAnswer';

/**
 * Every exercise of a homework (or of a lesson, which keeps its exercises in the same shape),
 * with answers saved through `onUpdate`.
 */
export function HomeworkExercises({ homework, onUpdate }: { homework: Homework; onUpdate: (next: Homework) => void }) {
  function persist(next: Homework) {
    onUpdate(next.status === 'not-started' ? { ...next, status: 'in-progress' } : next);
  }

  function handleAnswerChange(exerciseId: string, itemIndex: number, blankIndex: number, value: string) {
    const progress = homework.progress[exerciseId];
    const userAnswers = (progress.userAnswers as string[][]).map((a, idx) =>
      idx === itemIndex ? a.map((b, bi) => (bi === blankIndex ? value : b)) : a
    );
    persist({ ...homework, progress: { ...homework.progress, [exerciseId]: { ...progress, userAnswers } } });
  }

  // Tapping an option answers it at once. It can be changed until right, but `correct` keeps the first try (that is the score).
  function handleMcAnswer(exerciseId: string, itemIndex: number, optionIndex: number) {
    const ex = homework.exercises.find((e) => e.id === exerciseId)!;
    const progress = homework.progress[exerciseId];
    const firstTry = !progress.checked[itemIndex];
    const userAnswers = (progress.userAnswers as (number | null)[]).map((v, idx) => (idx === itemIndex ? optionIndex : v));
    const checked = progress.checked.map((v, idx) => (idx === itemIndex ? true : v));
    const correct = firstTry
      ? progress.correct.map((v, idx) => (idx === itemIndex ? isMultipleChoiceItemCorrect(ex.items[itemIndex] as MultipleChoiceItem, optionIndex) : v))
      : progress.correct;
    persist({ ...homework, progress: { ...homework.progress, [exerciseId]: { ...progress, userAnswers, checked, correct } } });
  }

  function handleCheck(exerciseId: string, itemIndex: number) {
    const ex = homework.exercises.find((e) => e.id === exerciseId)!;
    const progress = homework.progress[exerciseId];
    const isCorrect = isFillBlankItemCorrect(ex.items[itemIndex] as FillBlankItem, progress.userAnswers[itemIndex] as string[]);
    const checked = progress.checked.map((v, idx) => (idx === itemIndex ? true : v));
    const correct = progress.correct.map((v, idx) => (idx === itemIndex ? isCorrect : v));
    persist({ ...homework, progress: { ...homework.progress, [exerciseId]: { ...progress, checked, correct } } });
  }

  return (
    <>
      {homework.exercises.map((ex) => {
        const progress = homework.progress[ex.id];
        return (
          <div key={ex.id} className="mb-6">
            <p className="mb-2 font-medium">{ex.instruction}</p>
            {ex.type === 'free-text' ? (
              <textarea
                aria-label={`Ответ: ${ex.instruction}`}
                className="min-h-28 w-full rounded-lg border bg-transparent p-2"
                placeholder="Ваш ответ…"
                value={(progress.userAnswers[0] as string[])[0] ?? ''}
                onChange={(e) => onUpdate(withFreeTextAnswer(homework, ex.id, 0, e.target.value))}
              />
            ) : ex.type === 'word-bank' ? (
              <WordBankExercise
                items={ex.items as FillBlankItem[]}
                bank={ex.bank ?? []}
                answers={progress.userAnswers as string[][]}
                onChange={(i, answers) => onUpdate(withWordBankAnswer(homework, ex.id, i, answers))}
              />
            ) : ex.type === 'word-list' ? (
              <HomeworkWords items={ex.items as WordListItem[]} checked={progress.checked} />
            ) : ex.type === 'sentence-order' ? (
              <SentenceOrderExercise
                items={ex.items as SentenceOrderItem[]}
                answers={progress.userAnswers as string[][]}
                onChange={(i, placed) => onUpdate(withSentenceAnswer(homework, ex.id, i, placed))}
              />
            ) : ex.type === 'fill-blank' ? (
              <FillBlankExercise
                items={ex.items as FillBlankItem[]}
                userAnswers={progress.userAnswers as string[][]}
                checked={progress.checked}
                onAnswerChange={(i, bi, v) => handleAnswerChange(ex.id, i, bi, v)}
                onCheck={(i) => handleCheck(ex.id, i)}
              />
            ) : (
              <MultipleChoiceExercise
                items={ex.items as MultipleChoiceItem[]}
                selected={progress.userAnswers as (number | null)[]}
                checked={progress.checked}
                onAnswer={(i, oi) => handleMcAnswer(ex.id, i, oi)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
