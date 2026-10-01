'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { VocabItem } from '@/types/models';
import { useTopics } from './useTopicContents';

interface EditVocabDialogProps {
  item: VocabItem;
  onSave: (item: VocabItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/** Edit a word or phrase in a topic: text, translation, example, topic — or delete it. */
export function EditVocabDialog({ item, onSave, onDelete, onClose }: EditVocabDialogProps) {
  const [form, setForm] = useState({
    english: item.english,
    translation: item.translation,
    ruPronunciation: item.ruPronunciation ?? '',
    example: item.example ?? '',
    exampleTranslation: item.exampleTranslation ?? '',
    category: item.category,
  });
  const [error, setError] = useState<string | null>(null);
  const topics = useTopics();
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    const english = form.english.trim();
    const translation = form.translation.trim();
    if (!english || !translation) {
      setError('Слово и перевод не могут быть пустыми.');
      return;
    }
    const englishChanged = english !== item.english;
    onSave({
      ...item,
      english,
      translation,
      ruPronunciation: form.ruPronunciation.trim() || undefined,
      // A new spelling makes the old transcription wrong.
      ipa: englishChanged ? undefined : item.ipa,
      example: form.example.trim() || undefined,
      exampleTranslation: form.exampleTranslation.trim() || undefined,
      category: form.category,
      edited: true,
    });
  }

  function remove() {
    if (window.confirm(`Удалить «${item.english}»? Оно удалится на всех устройствах.`)) onDelete(item.id);
  }

  const field = 'rounded border bg-transparent px-2 py-1.5';

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md rounded-b-none bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-4 dark:bg-[#0f0c18]"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">✏️ Изменить</h2>
          <button type="button" aria-label="Закрыть" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">По-английски<input autoCapitalize="none" autoCorrect="off" className={field} value={form.english} onChange={set('english')} /></label>
          <label className="flex flex-col gap-1">Перевод<input className={field} value={form.translation} onChange={set('translation')} /></label>
          <label className="flex flex-col gap-1">Произношение русскими буквами<input className={field} value={form.ruPronunciation} onChange={set('ruPronunciation')} /></label>
          <label className="flex flex-col gap-1">Тема
            <select className={field} value={form.category} onChange={set('category')}>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">Пример<input autoCapitalize="none" className={field} value={form.example} onChange={set('example')} /></label>
          <label className="flex flex-col gap-1">Перевод примера<input className={field} value={form.exampleTranslation} onChange={set('exampleTranslation')} /></label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center gap-2">
          <button type="submit" className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 py-2 font-semibold text-white shadow-md shadow-pink-500/20">
            Сохранить
          </button>
          <button type="button" aria-label="Удалить" className="rounded-full border p-2 text-red-600" onClick={remove}>
            <Trash2 size={18} />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">Прогресс изучения слова сохранится.</p>
      </form>
    </div>
  );
}
