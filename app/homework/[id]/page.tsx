'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { Homework } from '@/types/models';
import { computeHomeworkScore, homeworkLabel } from '@/lib/learning/homework';
import { syncWordListProgress } from '@/lib/learning/homeworkWords';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { toISODate } from '@/lib/learning/date';
import { ImagePicker } from '@/components/homework/ImagePicker';
import { HomeworkExercises } from '@/components/homework/HomeworkExercises';
import { BackLink } from '@/components/shared/BackLink';

export default function HomeworkRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const homework = useHomeworkStore((s) => s.items.find((h) => h.id === id));
  const updateStore = useHomeworkStore((s) => s.update);
  const [saveError, setSaveError] = useState<string | null>(null);
  const words = useWordsStore((s) => s.items);

  // Words learned anywhere in the app (flashcards «Знаю») tick off the homework's word list.
  useEffect(() => {
    if (!homework) return;
    const synced = syncWordListProgress(homework, words);
    if (synced !== homework) updateStore(synced);
  }, [homework, words, updateStore]);

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

  function handleSubmit() {
    const score = computeHomeworkScore(homework!);
    update({ ...homework!, status: 'completed', score, completedDate: toISODate(new Date()) });
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
      <HomeworkExercises homework={homework} onUpdate={update} />
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
