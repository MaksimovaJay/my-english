'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { TOPICS } from '@/lib/seed/topics';
import { createInitialReviewState } from '@/lib/learning/review';
import { toISODate } from '@/lib/learning/date';
import { generateId } from '@/lib/utils';

const EMPTY = { english: '', translation: '', category: 'my-words', example: '', exampleTranslation: '' };

/** Floating «+» on every page: jot down a new word; it lands in a topic and in review right away. */
export function QuickAddWord() {
  const words = useWordsStore((s) => s.items);
  const add = useWordsStore((s) => s.add);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError(null);
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    const english = form.english.trim();
    const translation = form.translation.trim();
    if (!english || !translation) {
      setError('Впишите слово и перевод.');
      return;
    }
    const existing = words.find((w) => w.english.toLowerCase() === english.toLowerCase());
    if (existing) {
      setError(`Это слово уже есть: ${existing.english} — ${existing.translation}`);
      return;
    }
    const today = new Date();
    add({
      id: generateId(),
      english,
      translation,
      category: form.category,
      example: form.example.trim() || undefined,
      exampleTranslation: form.exampleTranslation.trim() || undefined,
      tags: [],
      dateAdded: toISODate(today),
      review: createInitialReviewState(today),
    });
    setSaved(english);
    setForm({ ...EMPTY, category: form.category });
  }

  function close() {
    setOpen(false);
    setError(null);
    setSaved(null);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Добавить слово"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition hover:scale-105 md:bottom-6 md:right-6"
        onClick={() => setOpen(true)}
      >
        <Plus size={28} />
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={close}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md rounded-b-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-4 bg-white dark:bg-[#0f0c18]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">+ Новое слово</h2>
              <button type="button" aria-label="Закрыть" onClick={close}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <label className="flex flex-col gap-1">
                Слово по-английски
                <input autoFocus autoCapitalize="none" autoCorrect="off" className="rounded border bg-transparent px-2 py-1.5" value={form.english} onChange={set('english')} />
              </label>
              <label className="flex flex-col gap-1">
                Перевод
                <input className="rounded border bg-transparent px-2 py-1.5" value={form.translation} onChange={set('translation')} />
              </label>
              <label className="flex flex-col gap-1">
                Тема
                <select className="rounded border bg-transparent px-2 py-1.5" value={form.category} onChange={set('category')}>
                  {TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Пример (необязательно)
                <input autoCapitalize="none" className="rounded border bg-transparent px-2 py-1.5" value={form.example} onChange={set('example')} />
              </label>
              <label className="flex flex-col gap-1">
                Перевод примера (необязательно)
                <input className="rounded border bg-transparent px-2 py-1.5" value={form.exampleTranslation} onChange={set('exampleTranslation')} />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {saved && !error && <p className="mt-3 text-sm text-green-600">✅ «{saved}» добавлено</p>}
            <button type="submit" className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-600 to-pink-500 py-2 font-semibold text-white shadow-md shadow-pink-500/20">
              Сохранить
            </button>
          </form>
        </div>
      )}
    </>
  );
}
