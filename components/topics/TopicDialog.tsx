'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Topic } from '@/types/models';
import { cn } from '@/lib/utils';

export interface TopicFormValues {
  title: string;
  emoji: string;
  group: Topic['group'];
}

interface TopicDialogProps {
  heading: string;
  initial?: Topic;
  /** Words and phrases in the topic (shown in the delete warning). */
  itemCount?: number;
  onSave: (values: TopicFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const GROUPS: { id: Topic['group']; label: string }[] = [
  { id: 'class', label: 'Пройдено на уроках' },
  { id: 'extra', label: 'Новое / не изученное' },
];

/** Create a topic, or rename / re-icon / move / delete one. */
export function TopicDialog({ heading, initial, itemCount = 0, onSave, onDelete, onClose }: TopicDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [group, setGroup] = useState<Topic['group']>(initial?.group ?? 'class');
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Напишите название темы.');
      return;
    }
    onSave({ title: title.trim(), emoji: emoji.trim() || '📁', group });
  }

  function remove() {
    const moved = itemCount > 0 ? ` ${itemCount} слов и фраз из неё переедут в «Мои слова».` : '';
    if (window.confirm(`Удалить тему «${initial?.title}»?${moved}`)) onDelete?.();
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
          <h2 className="text-lg font-bold">{heading}</h2>
          <button type="button" aria-label="Закрыть" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex gap-2">
            <label className="flex w-20 flex-col gap-1">
              Значок
              <input className={cn(field, 'text-center text-xl')} maxLength={4} placeholder="📁" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              Название
              <input autoFocus className={field} value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} />
            </label>
          </div>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">Раздел</legend>
            {GROUPS.map((g) => (
              <label key={g.id} className="flex items-center gap-2">
                <input type="radio" name="group" checked={group === g.id} onChange={() => setGroup(g.id)} />
                {g.label}
              </label>
            ))}
          </fieldset>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center gap-2">
          <button type="submit" className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 py-2 font-semibold text-white shadow-md shadow-pink-500/20">
            Сохранить
          </button>
          {onDelete && (
            <button type="button" aria-label="Удалить тему" className="rounded-full border p-2 text-red-600" onClick={remove}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
