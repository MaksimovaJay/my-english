'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { updateReviewState } from '@/lib/learning/review';
import { Flashcard } from './Flashcard';
import { cn } from '@/lib/utils';

interface FlashcardDeckProps {
  items: VocabItem[];
  onUpdateItem: (item: VocabItem) => void;
}

export function FlashcardDeck({ items, onUpdateItem }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'en-ru' | 'ru-en'>('en-ru');

  if (items.length === 0) return <p className="text-sm text-gray-500">No cards to study yet.</p>;
  if (index >= items.length) return <p className="text-lg font-medium">Done for now! 🎉</p>;

  const current = items[index];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'en-ru' && 'bg-blue-600 text-white')}
          onClick={() => setDirection('en-ru')}
        >
          🇬🇧 → 🇷🇺
        </button>
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'ru-en' && 'bg-blue-600 text-white')}
          onClick={() => setDirection('ru-en')}
        >
          🇷🇺 → 🇬🇧
        </button>
      </div>
      <Flashcard
        item={current}
        direction={direction}
        onOutcome={(outcome) => {
          onUpdateItem({ ...current, review: updateReviewState(current.review, outcome) });
          setIndex((i) => i + 1);
        }}
      />
      <p className="text-xs text-gray-400">{index + 1} / {items.length}</p>
    </div>
  );
}
