'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { wordOfDay } from '@/lib/learning/plan';
import { toISODate } from '@/lib/learning/date';
import { ListenButton } from '@/components/shared/ListenButton';

export function WordOfDay() {
  const word = wordOfDay(useWordsStore((s) => s.items), toISODate(new Date()));
  if (!word) return null;
  return (
    <section className="card p-4 text-left">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">✨ Слово дня</h2>
      <div className="flex items-center gap-2">
        <span className="text-gradient text-2xl font-extrabold">{word.english}</span>
        <ListenButton text={word.english} />
        {word.ruPronunciation && <span className="text-sm text-gray-500">[{word.ruPronunciation}]</span>}
      </div>
      <p>{word.translation}</p>
      {word.example && (
        <p className="mt-1 text-sm text-gray-500">
          <span>{word.example}</span>
          {word.exampleTranslation && <span> — {word.exampleTranslation}</span>}
        </p>
      )}
    </section>
  );
}
