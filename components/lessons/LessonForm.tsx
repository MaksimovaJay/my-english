'use client';

import { useState } from 'react';
import { GameId } from '@/types/models';
import { DEFAULT_LESSON_GAMES, LessonInput } from '@/lib/learning/lessons';
import { parseWordLines } from '@/lib/learning/homeworkWords';
import { toISODate } from '@/lib/learning/date';
import { ImagePicker } from '@/components/homework/ImagePicker';
import { PRACTICE_MODES } from '@/components/topics/TopicPractice';

interface LessonFormProps {
  onSave: (input: LessonInput) => void;
  onCancel: () => void;
  compress?: (file: Blob) => Promise<string>;
}

const field = 'rounded border bg-transparent px-2 py-1.5 font-normal';

/** The teacher prepares a lesson: name, description, pictures, words, conditions, rules and which games to play. */
export function LessonForm({ onSave, onCancel, compress }: LessonFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [words, setWords] = useState('');
  const [conditions, setConditions] = useState('');
  const [rules, setRules] = useState('');
  const [games, setGames] = useState<GameId[]>(DEFAULT_LESSON_GAMES);
  const [error, setError] = useState<string | null>(null);
  const parsed = parseWordLines(words);

  function toggleGame(id: GameId) {
    setGames((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      onSave({ title, date, description, images, words, conditions, rules, games });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить.');
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 flex flex-col gap-4 p-4 text-sm">
      <h2 className="text-lg font-semibold">🎓 Новый урок</h2>

      <div className="flex flex-wrap gap-3">
        <label className="flex min-w-48 flex-1 flex-col gap-1 font-medium">
          Название
          <input className={field} placeholder="например, Past simple: was / were" value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} />
        </label>
        <label className="flex flex-col gap-1 font-medium">
          Дата урока
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label className="flex flex-col gap-1 font-medium">
        Описание
        <textarea className={`${field} min-h-16`} placeholder="о чём урок" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div>
        <p className="mb-1 font-medium">Картинки</p>
        <ImagePicker images={images} onChange={setImages} compress={compress} />
      </div>

      <label className="flex flex-col gap-1 font-medium">
        📚 Слова
        <span className="text-xs font-normal text-gray-500">Одно слово на строку: слово = перевод. В темы и повторение они попадут после урока.</span>
        <textarea className={`${field} min-h-24`} placeholder={'noisy = шумный\nquiet = тихий'} autoCapitalize="none" value={words} onChange={(e) => setWords(e.target.value)} />
        {(parsed.words.length > 0 || parsed.skipped.length > 0) && (
          <span className="text-xs font-normal text-gray-500">
            Слов: {parsed.words.length}
            {parsed.skipped.length > 0 && <span className="text-amber-600"> · без перевода, не добавятся: {parsed.skipped.join(', ')}</span>}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 font-medium">
        📋 Условия
        <textarea className={`${field} min-h-16`} placeholder="что делаем на уроке и в каком порядке" value={conditions} onChange={(e) => setConditions(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 font-medium">
        📖 Правила
        <textarea className={`${field} min-h-20`} placeholder="объяснение грамматики" value={rules} onChange={(e) => setRules(e.target.value)} />
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 font-medium">🎮 Игры на уроке</legend>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {PRACTICE_MODES.map((m) => (
            <label key={m.id} className="flex items-center gap-2">
              <input type="checkbox" checked={games.includes(m.id)} onChange={() => toggleGame(m.id)} />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2 font-semibold text-white shadow-md shadow-pink-500/20">
          Сохранить урок
        </button>
        <button type="button" className="rounded-full border px-4 py-2" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
}
