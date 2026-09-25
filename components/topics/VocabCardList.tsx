'use client';

import { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { VocabItem } from '@/types/models';
import { ListenButton } from '@/components/shared/ListenButton';

export function VocabCardList({ items }: { items: VocabItem[] }) {
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggleHidden() {
    setHidden((h) => !h);
    setRevealed(new Set());
  }

  return (
    <div>
      <button
        type="button"
        className="mb-3 flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
        onClick={toggleHidden}
      >
        {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
        {hidden ? 'Показать перевод' : 'Скрыть перевод'}
      </button>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const showTranslation = !hidden || revealed.has(item.id);
          return (
            <li
              key={item.id}
              className="cursor-pointer rounded-lg border p-3"
              onClick={() => setRevealed((prev) => new Set(prev).add(item.id))}
            >
              <div className="flex items-center gap-1">
                <span className="font-semibold">{item.english}</span>
                <span onClick={(e) => e.stopPropagation()}>
                  <ListenButton text={item.english} />
                </span>
                {item.ruPronunciation && <span className="text-xs text-gray-500">[{item.ruPronunciation}]</span>}
              </div>
              {showTranslation ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.translation}</p>
              ) : (
                <p className="text-sm italic text-gray-400">нажмите, чтобы увидеть</p>
              )}
              {item.example && (
                <p className="mt-1 text-xs text-gray-500">
                  <span>{item.example}</span>
                  {showTranslation && item.exampleTranslation && <span> — {item.exampleTranslation}</span>}
                </p>
              )}
              {item.notes && <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">💡 {item.notes}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
