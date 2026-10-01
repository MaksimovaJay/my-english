'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLessonsStore } from '@/lib/storage/lessonsStore';
import { buildLesson, LessonInput, nextLessonNumber } from '@/lib/learning/lessons';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { LessonForm } from '@/components/lessons/LessonForm';
import { pluralRu } from '@/lib/utils';

export default function LessonsPage() {
  const lessons = useLessonsStore((s) => s.items);
  const addLesson = useLessonsStore((s) => s.add);
  const [creating, setCreating] = useState(false);
  const sorted = [...lessons].sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number);

  function save(input: LessonInput) {
    const lesson = buildLesson(input, nextLessonNumber(lessons));
    try {
      addLesson(lesson);
    } catch (err) {
      throw isQuotaError(err) ? new Error(QUOTA_MESSAGE) : err;
    }
    setCreating(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🎓 Уроки</h1>
        {!creating && (
          <button type="button" className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-1.5 text-sm text-white shadow-md shadow-pink-500/20" onClick={() => setCreating(true)}>
            + Новый урок
          </button>
        )}
      </div>
      {creating && <LessonForm onSave={save} onCancel={() => setCreating(false)} />}
      {lessons.length === 0 && !creating && <p className="text-sm text-gray-500">Уроков пока нет. Учитель готовит урок кнопкой «+ Новый урок».</p>}
      <ul className="flex flex-col gap-2">
        {sorted.map((l) => (
          <li key={l.id}>
            <Link href={`/lessons/${l.id}`} className="card flex items-center gap-3 p-3 transition hover:border-pink-400">
              <span className="text-2xl" aria-hidden>{l.status === 'completed' ? '✅' : '🎓'}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Урок {l.number} · {l.title}</span>
                <span className="text-xs text-gray-500">
                  {l.date} · {l.words.length} {pluralRu(l.words.length, ['слово', 'слова', 'слов'])} · {l.status === 'completed' ? 'проведён' : 'запланирован'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
