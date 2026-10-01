'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { updateReviewState } from '@/lib/learning/review';
import { Flashcard } from './Flashcard';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { cn } from '@/lib/utils';

interface FlashcardDeckProps {
  items: VocabItem[];
  onUpdateItem: (item: VocabItem) => void;
}

export function FlashcardDeck({ items, onUpdateItem }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  // Cards answered «Не знаю» come back once more at the end of this session.
  const [retry, setRetry] = useState<VocabItem[]>([]);
  const queue = [...items, ...retry];
  const [direction, setDirection] = useState<'en-ru' | 'ru-en'>('en-ru');

  if (items.length === 0) return <p className="text-sm text-gray-500">Здесь пока нет карточек.</p>;
  if (index >= queue.length) return <p className="text-lg font-medium">На сегодня всё! 🎉</p>;

  const current = queue[index];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'en-ru' && 'bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 text-white')}
          onClick={() => setDirection('en-ru')}
        >
          🇬🇧 → 🇷🇺
        </button>
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'ru-en' && 'bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 text-white')}
          onClick={() => setDirection('ru-en')}
        >
          🇷🇺 → 🇬🇧
        </button>
      </div>
      <Flashcard
        item={current}
        direction={direction}
        onOutcome={(outcome) => {
          const updated = { ...current, review: updateReviewState(current.review, outcome) };
          onUpdateItem(updated);
          if (outcome === 'again') setRetry((r) => [...r, updated]);
          useSettingsStore.getState().bumpDaily('reviewed');
          setIndex((i) => i + 1);
        }}
      />
      <p className="text-xs text-gray-400">{index + 1} / {queue.length}</p>
    </div>
  );
}
