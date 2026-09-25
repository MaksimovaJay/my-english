'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { FillBlankExercise } from '@/components/exercises/FillBlankExercise';
import { MultipleChoiceExercise } from '@/components/exercises/MultipleChoiceExercise';
import { FillBlankItem, Homework, MultipleChoiceItem } from '@/types/models';
import { computeHomeworkScore, homeworkLabel, withFreeTextAnswer } from '@/lib/learning/homework';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { ImagePicker } from '@/components/homework/ImagePicker';
import { BackLink } from '@/components/shared/BackLink';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from '@/lib/learning/checkAnswer';

export default function HomeworkRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const homework = useHomeworkStore((s) => s.items.find((h) => h.id === id));
  const updateStore = useHomeworkStore((s) => s.update);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!homework) {
    return (
      <div>
        <BackLink href="/homework" label="Ко всем домашкам" />
        <p className="text-sm text-gray-500">Домашка не найдена.</p>
      </div>
    );
  }

  function update(next: Homework) {
    try {
      updateStore(next);
      setSaveError(null);
    } catch (err) {
      setSaveError(isQuotaError(err) ? QUOTA_MESSAGE : 'Не удалось сохранить.');
    }
  }

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
  const hasAutoChecked = homework.exercises.some((ex) => ex.type !== 'free-text');

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/homework" label="Ко всем домашкам" />
      <h1 className="mb-1 text-xl font-bold">{homeworkLabel(homework)}</h1>
      <p className="mb-4 text-xs text-gray-500">
        Задано {homework.assignedDate}{homework.dueDate ? ` · Сдать до ${homework.dueDate}` : ''}
      </p>
      {saveError && <p className="mb-3 text-sm text-red-600">{saveError}</p>}
      {homework.teacherNotes && (
        <div className="mb-4 whitespace-pre-line rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
          <p className="mb-1 font-medium">Заметки учителя</p>
          {homework.teacherNotes}
        </div>
      )}
      {(homework.images?.length || homework.exercises.some((ex) => ex.type === 'free-text')) && (
        <div className="mb-6">
          <p className="mb-1 text-sm font-medium">Скриншоты</p>
          <ImagePicker images={homework.images ?? []} onChange={(images) => update({ ...homework, images })} />
        </div>
      )}
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
                onChange={(e) => update(withFreeTextAnswer(homework, ex.id, 0, e.target.value))}
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
                onSelect={(i, oi) => handleSelect(ex.id, i, oi)}
                onCheck={(i) => handleCheck(ex.id, i)}
              />
            )}
          </div>
        );
      })}
      {homework.status === 'completed' && (
        <p className="mb-3 font-medium">
          {hasAutoChecked && homework.score ? `Результат: ${homework.score.correct} / ${homework.score.total}` : '✅ Отправлено на проверку'}
        </p>
      )}
      <button
        disabled={!allChecked}
        className="rounded bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        onClick={handleSubmit}
      >
        СДАТЬ ДОМАШКУ
      </button>
    </div>
  );
}
