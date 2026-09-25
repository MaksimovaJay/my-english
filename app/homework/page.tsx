'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { parseHomeworkImport, homeworkProgressFraction } from '@/lib/learning/homework';
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

export default function HomeworkPage() {
  const homeworks = useHomeworkStore((s) => s.items);
  const addHomework = useHomeworkStore((s) => s.add);
  const removeHomework = useHomeworkStore((s) => s.remove);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
        <div>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => fileInputRef.current?.click()}>
            Загрузить домашку (JSON)
          </button>
        </div>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {homeworks.length === 0 && (
        <p className="text-sm text-gray-500">Домашек пока нет — пришлите фото задания в чат Claude.</p>
      )}
      {homeworks.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">Дата</th>
              <th className="px-2 py-1">Задание</th>
              <th className="px-2 py-1">Прогресс</th>
              <th className="px-2 py-1">Статус</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {homeworks.map((hw) => {
              const { done, total } = homeworkProgressFraction(hw);
              return (
                <tr key={hw.id} className="border-b last:border-0">
                  <td className="px-2 py-1">{hw.assignedDate}</td>
                  <td className="px-2 py-1"><Link href={`/homework/${hw.id}`} className="text-blue-600 underline">{hw.title}</Link></td>
                  <td className="px-2 py-1">{done} / {total}</td>
                  <td className="px-2 py-1">{STATUS_LABELS[hw.status]}</td>
                  <td className="px-2 py-1"><button aria-label="Удалить" onClick={() => removeHomework(hw.id)}>🗑</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
