'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { ReviewOutcome } from '@/lib/learning/review';
import { ListenButton } from '@/components/shared/ListenButton';

interface FlashcardProps {
  item: VocabItem;
  direction: 'en-ru' | 'ru-en';
  onOutcome: (outcome: ReviewOutcome) => void;
}

export function Flashcard({ item, direction, onOutcome }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);
  const front = direction === 'en-ru' ? item.english : item.translation;

  function handleOutcome(outcome: ReviewOutcome) {
    onOutcome(outcome);
    setRevealed(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm">
      <p className="text-2xl font-bold">{front}</p>
      {direction === 'en-ru' && <ListenButton text={item.english} />}
      {!revealed && (
        <button className="text-sm text-gray-500 underline" onClick={() => setRevealed(true)}>
          Tap to reveal
        </button>
      )}
      {revealed && (
        <div className="flex flex-col items-center gap-1">
          {direction === 'en-ru' ? (
            <>
              {item.ipa && <p className="text-gray-500">{item.ipa}</p>}
              <p className="text-lg">{item.translation}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">{item.english}</p>
              {item.ipa && <p className="text-gray-500">{item.ipa}</p>}
            </>
          )}
          {item.example && <p className="text-sm italic text-gray-500">{item.example}</p>}
        </div>
      )}
      {revealed && (
        <div className="flex gap-2">
          <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700" onClick={() => handleOutcome('again')}>❌ Don&apos;t know</button>
          <button className="rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-700" onClick={() => handleOutcome('hard')}>🤔 Hard</button>
          <button className="rounded bg-green-100 px-3 py-1 text-sm text-green-700" onClick={() => handleOutcome('know')}>✅ Know</button>
        </div>
      )}
    </div>
  );
}
