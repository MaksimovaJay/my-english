'use client';

import { useParams } from 'next/navigation';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { FillBlankExercise } from '@/components/exercises/FillBlankExercise';
import { MultipleChoiceExercise } from '@/components/exercises/MultipleChoiceExercise';
import { FillBlankItem, Homework, MultipleChoiceItem } from '@/types/models';
import { computeHomeworkScore, homeworkLabel } from '@/lib/learning/homework';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from '@/lib/learning/checkAnswer';

export default function HomeworkRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const homework = useHomeworkStore((s) => s.items.find((h) => h.id === id));
  const update = useHomeworkStore((s) => s.update);

  if (!homework) return <p className="text-sm text-gray-500">Домашка не найдена.</p>;

  function persist(next: Homework) {
    update(next.status === 'not-started' ? { ...next, status: 'in-progress' } : next);
  }

  function handleAnswerChange(exerciseId: string, itemIndex: number, blankIndex: number, value: string) {
    const progress = homework!.progress[exerciseId];
    const userAnswers = (progress.userAnswers as string[][]).map((a, idx) =>
      idx === itemIndex ? a.map((b, bi) => (bi === blankIndex ? value : b)) : a
    );
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, userAnswers } } });
  }

  function handleSelect(exerciseId: string, itemIndex: number, optionIndex: number) {
    const progress = homework!.progress[exerciseId];
    const userAnswers = (progress.userAnswers as (number | null)[]).map((v, idx) => (idx === itemIndex ? optionIndex : v));
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, userAnswers } } });
  }

  function handleCheck(exerciseId: string, itemIndex: number) {
    const ex = homework!.exercises.find((e) => e.id === exerciseId)!;
    const progress = homework!.progress[exerciseId];
    const item = ex.items[itemIndex];
    const isCorrect = ex.type === 'fill-blank'
      ? isFillBlankItemCorrect(item as FillBlankItem, progress.userAnswers[itemIndex] as string[])
      : isMultipleChoiceItemCorrect(item as MultipleChoiceItem, progress.userAnswers[itemIndex] as number | null);
    const checked = progress.checked.map((v, idx) => (idx === itemIndex ? true : v));
    const correct = progress.correct.map((v, idx) => (idx === itemIndex ? isCorrect : v));
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, checked, correct } } });
  }

  function handleSubmit() {
    const score = computeHomeworkScore(homework!);
    update({ ...homework!, status: 'completed', score });
  }

  const allChecked = homework.exercises.every((ex) => homework.progress[ex.id]?.checked.every(Boolean));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">{homeworkLabel(homework)}</h1>
      <p className="mb-4 text-xs text-gray-500">
        Задано {homework.assignedDate}{homework.dueDate ? ` · Сдать до ${homework.dueDate}` : ''}
      </p>
      {homework.exercises.map((ex) => {
        const progress = homework.progress[ex.id];
        return (
          <div key={ex.id} className="mb-6">
            <p className="mb-2 font-medium">{ex.instruction}</p>
            {ex.type === 'fill-blank' ? (
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
                onSelect={(i, oi) => handleSelect(ex.id, i, oi)}
                onCheck={(i) => handleCheck(ex.id, i)}
              />
            )}
          </div>
        );
      })}
      {homework.status === 'completed' && homework.score && (
        <p className="mb-3 font-medium">Результат: {homework.score.correct} / {homework.score.total}</p>
      )}
      <button
        disabled={!allChecked}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        onClick={handleSubmit}
      >
        СДАТЬ ДОМАШКУ
      </button>
    </div>
  );
}
