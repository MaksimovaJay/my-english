'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AssignHomeworkInput } from '@/lib/learning/homework';
import { toISODate } from '@/lib/learning/date';
import { ImagePicker } from './ImagePicker';

interface AssignHomeworkFormProps {
  onSave: (input: AssignHomeworkInput) => void;
  onCancel: () => void;
  compress?: (file: Blob) => Promise<string>;
}

export function AssignHomeworkForm({ onSave, onCancel, compress }: AssignHomeworkFormProps) {
  const [bookNumbers, setBookNumbers] = useState<string[]>(['', '']);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [assignedDate, setAssignedDate] = useState(toISODate(new Date()));
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  function setRow(i: number, value: string) {
    setBookNumbers((rows) => rows.map((r, j) => (j === i ? value : r)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (bookNumbers.every((n) => n.trim() === '')) {
      setError('Добавьте хотя бы один номер из книги.');
      return;
    }
    try {
      onSave({ bookNumbers, teacherNotes, images, assignedDate, dueDate });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить.');
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 flex flex-col gap-4 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Задать домашку</h2>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Номера в книге</legend>
        {bookNumbers.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              aria-label={`Номер ${i + 1}`}
              className="w-full rounded border bg-transparent px-2 py-1"
              placeholder="например, 12.1 или стр. 25"
              value={value}
              onChange={(e) => setRow(i, e.target.value)}
            />
            {bookNumbers.length > 1 && (
              <button
                type="button"
                aria-label={`Убрать номер ${i + 1}`}
                className="text-gray-400 hover:text-red-600"
                onClick={() => setBookNumbers((rows) => rows.filter((_, j) => j !== i))}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className="w-fit text-sm text-blue-600 underline" onClick={() => setBookNumbers((rows) => [...rows, ''])}>
          + ещё номер
        </button>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Заметки учителя
        <textarea
          className="min-h-20 rounded border bg-transparent px-2 py-1 font-normal"
          placeholder="что сделать, на что обратить внимание…"
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
        />
      </label>

      <div>
        <p className="mb-1 text-sm font-medium">Скриншоты</p>
        <ImagePicker images={images} onChange={setImages} compress={compress} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex flex-col gap-1">
          Задано
          <input type="date" className="rounded border bg-transparent px-2 py-1" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          Сдать до
          <input type="date" className="rounded border bg-transparent px-2 py-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white">Сохранить</button>
        <button type="button" className="rounded border px-4 py-1.5 text-sm" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
}
