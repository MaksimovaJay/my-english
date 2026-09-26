'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { TypingPractice } from '@/components/exercises/TypingPractice';
import { ListeningPractice } from '@/components/exercises/ListeningPractice';
import { MatchingGame } from '@/components/games/MatchingGame';
import { FloatingWords } from '@/components/games/FloatingWords';
import { SentenceBuilder } from '@/components/games/SentenceBuilder';
import { LetterGuess } from '@/components/games/LetterGuess';
import { TimedQuiz } from '@/components/games/TimedQuiz';
import { cn } from '@/lib/utils';

type Mode = 'flashcards' | 'typing' | 'listening' | 'sentence' | 'letters' | 'matching' | 'floating' | 'timed';

const MODES: { id: Mode; label: string }[] = [
  { id: 'flashcards', label: 'Карточки' },
  { id: 'typing', label: 'Написание' },
  { id: 'listening', label: 'На слух' },
  { id: 'sentence', label: 'Собери предложение' },
  { id: 'letters', label: 'Буквы' },
  { id: 'matching', label: 'Найди пару' },
  { id: 'floating', label: 'Лови слова' },
  { id: 'timed', label: 'На время' },
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
            className={cn('rounded-full border px-3 py-1 text-sm', mode === m.id && 'border-transparent bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 text-white')}
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
      {mode === 'sentence' && <SentenceBuilder items={items} />}
      {mode === 'letters' && <LetterGuess items={items} />}
      {mode === 'timed' && <TimedQuiz items={items} />}
    </div>
  );
}
