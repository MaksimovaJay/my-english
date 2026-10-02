'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { parseHomeworkImport, homeworkProgressFraction, homeworkLabel, buildAssignedHomework, groupHomeworkByWeek, nextHomeworkNumber, AssignHomeworkInput } from '@/lib/learning/homework';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { AssignHomeworkForm } from '@/components/homework/AssignHomeworkForm';
import { prepareHomeworkWords } from '@/lib/learning/homeworkWords';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { Homework } from '@/types/models';

// jsdom's File/Blob implementation does not provide `.text()` (or `.arrayBuffer()`/`.stream()`),
// so file content is read via FileReader, which is supported both in the browser and in tests.
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

const STATUS_LABELS: Record<Homework['status'], string> = {
  'not-started': 'Не начато',
  'in-progress': 'В процессе',
  completed: 'Готово',
};

const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

/** '2026-09-25' → 'пт 25.09' */
function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]} ${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

export default function HomeworkPage() {
  const homeworks = useHomeworkStore((s) => s.items);
  const addHomework = useHomeworkStore((s) => s.add);
  const removeHomework = useHomeworkStore((s) => s.remove);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [justDone, setJustDone] = useState<string | null>(null);
  const active = homeworks.filter((h) => h.status !== 'completed');
  const finished = homeworks.filter((h) => h.status === 'completed');
  const justDoneHomework = finished.find((h) => h.id === justDone);

  // After «Сдать домашку» the runner sends us to /homework?done=<id>: say so and show where it went.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('done');
    if (!id) return;
    setJustDone(id);
    requestAnimationFrame(() => document.getElementById(`hw-${id}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }));
  }, []);

  function resultText(hw: Homework): string {
    if (hw.status !== 'completed') return STATUS_LABELS[hw.status];
    return hw.score && hw.score.total > 0 ? `Результат ${hw.score.correct} / ${hw.score.total}` : 'Сдано на проверку';
  }

  function renderWeeks(list: Homework[]) {
    return groupHomeworkByWeek(list).map((week) => (
      <section key={week.label} className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{week.label}</h3>
        <ul className="flex flex-col gap-2">
          {week.items.map((hw) => {
            const { done, total } = homeworkProgressFraction(hw);
            return (
              <li key={hw.id} id={`hw-${hw.id}`} className={cn('flex items-center gap-3 rounded-lg border p-3', hw.id === justDone && 'border-green-500 ring-2 ring-green-500/40')}>
                <div className="min-w-0 flex-1">
                  <Link href={`/homework/${hw.id}`} className="font-medium text-violet-600 underline">{homeworkLabel(hw)}</Link>
                  <p className="text-xs text-gray-500">
                    {formatShortDate(hw.assignedDate)} · {hw.status === 'completed' ? resultText(hw) : `${done} / ${total} · ${resultText(hw)}`}
                  </p>
                </div>
                <button
                  aria-label="Удалить"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => {
                    if (window.confirm(`Удалить «${homeworkLabel(hw)}»? Она удалится на всех устройствах.`)) removeHomework(hw.id);
                  }}
                >
                  🗑
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    ));
  }

  function handleAssign(input: AssignHomeworkInput) {
    // Words go into the base right away (new ones only), so they are in topics and review even before the homework is opened.
    const { items: wordItems, newWords } = prepareHomeworkWords(input.words ?? '', useWordsStore.getState().items);
    const homework = buildAssignedHomework({ ...input, wordItems }, nextHomeworkNumber(homeworks));
    try {
      newWords.forEach((w) => useWordsStore.getState().add(w));
      addHomework(homework);
    } catch (err) {
      throw isQuotaError(err) ? new Error(QUOTA_MESSAGE) : err;
    }
    setAssigning(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      addHomework(parseHomeworkImport(text));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import homework.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">📝 Домашка</h1>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
          <button className="text-xs text-gray-500 underline" onClick={() => fileInputRef.current?.click()}>
            Загрузить JSON
          </button>
          {!assigning && (
            <button className="rounded bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 px-3 py-1.5 text-sm text-white" onClick={() => setAssigning(true)}>
              + Задать домашку
            </button>
          )}
        </div>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {assigning && <AssignHomeworkForm onSave={handleAssign} onCancel={() => setAssigning(false)} />}
      {homeworks.length === 0 && (
        <p className="text-sm text-gray-500">Домашек пока нет — пришлите фото задания в чат Claude.</p>
      )}
      {justDoneHomework && (
        <p role="status" className="card mb-4 border-green-500 p-3 text-sm">
          ✅ {homeworkLabel(justDoneHomework)} сдано и перенесено в «Сделано».
        </p>
      )}

      {active.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-bold">📝 Задано</h2>
          {renderWeeks(active)}
        </>
      )}
      {homeworks.length > 0 && active.length === 0 && <p className="mb-6 text-sm text-gray-500">🎉 Все домашки сделаны!</p>}

      {finished.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-bold">✅ Сделано</h2>
          {renderWeeks(finished)}
        </>
      )}
    </div>
  );
}
