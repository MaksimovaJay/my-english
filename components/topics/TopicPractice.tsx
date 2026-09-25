'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { TypingPractice } from '@/components/exercises/TypingPractice';
import { ListeningPractice } from '@/components/exercises/ListeningPractice';
import { MatchingGame } from '@/components/games/MatchingGame';
import { FloatingWords } from '@/components/games/FloatingWords';
import { cn } from '@/lib/utils';

type Mode = 'flashcards' | 'typing' | 'listening' | 'matching' | 'floating';

const MODES: { id: Mode; label: string }[] = [
  { id: 'flashcards', label: 'Карточки' },
  { id: 'typing', label: 'Написание' },
  { id: 'listening', label: 'На слух' },
  { id: 'matching', label: 'Найди пару' },
  { id: 'floating', label: 'Лови слова' },
];

interface TopicPracticeProps {
  items: VocabItem[];
  onUpdateItem: (item: VocabItem) => void;
}

export function TopicPractice({ items, onUpdateItem }: TopicPracticeProps) {
  const [mode, setMode] = useState<Mode>('flashcards');

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={cn('rounded-full border px-3 py-1 text-sm', mode === m.id && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'flashcards' && <FlashcardDeck items={items} onUpdateItem={onUpdateItem} />}
      {mode === 'typing' && <TypingPractice items={items} />}
      {mode === 'listening' && <ListeningPractice items={items} />}
      {mode === 'matching' && <MatchingGame items={items} />}
      {mode === 'floating' && <FloatingWords items={items} />}
    </div>
  );
}
