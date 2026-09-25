'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { parseHomeworkImport, homeworkProgressFraction, homeworkLabel, buildAssignedHomework, groupHomeworkByWeek, nextHomeworkNumber, AssignHomeworkInput } from '@/lib/learning/homework';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { AssignHomeworkForm } from '@/components/homework/AssignHomeworkForm';
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

  function handleAssign(input: AssignHomeworkInput) {
    const homework = buildAssignedHomework(input, nextHomeworkNumber(homeworks));
    try {
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
            <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white" onClick={() => setAssigning(true)}>
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
      {groupHomeworkByWeek(homeworks).map((week) => (
        <section key={week.label} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{week.label}</h2>
          <ul className="flex flex-col gap-2">
            {week.items.map((hw) => {
              const { done, total } = homeworkProgressFraction(hw);
              return (
                <li key={hw.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/homework/${hw.id}`} className="font-medium text-blue-600 underline">{homeworkLabel(hw)}</Link>
                    <p className="text-xs text-gray-500">
                      {formatShortDate(hw.assignedDate)} · {done} / {total} · {STATUS_LABELS[hw.status]}
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
      ))}
    </div>
  );
}
