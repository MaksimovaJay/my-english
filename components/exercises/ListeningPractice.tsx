'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { buildListeningRound } from '@/lib/learning/listeningPractice';
import { ListenButton } from '@/components/shared/ListenButton';
import { cn } from '@/lib/utils';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useAutoAdvance } from './useAutoAdvance';

interface ListeningPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

export function ListeningPractice({ items, random = Math.random }: ListeningPracticeProps) {
  const [roundKey, setRoundKey] = useState(0);
  const round = useMemo(() => buildListeningRound(items, random), [items, random, roundKey]);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const advance = useAutoAdvance();

  function nextRound() {
    setWrong(new Set());
    setSolved(false);
    setRoundKey((k) => k + 1);
  }

  function choose(id: string) {
    if (!round || solved) return;
    if (id === round.target.id) {
      setSolved(true);
      recordGameCorrect();
      advance(nextRound);
    } else {
      setWrong((prev) => new Set(prev).add(id));
    }
  }

  if (!round) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ListenButton text={round.target.english} className="scale-150" />
      <div className="flex flex-wrap justify-center gap-2">
        {round.options.map((opt) => (
          <button
            key={opt.id}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              solved && opt.id === round.target.id && 'border-green-500 bg-green-50 dark:bg-green-950/40',
              wrong.has(opt.id) && 'border-red-500 bg-red-50 opacity-60 dark:bg-red-950/40'
            )}
            onClick={() => choose(opt.id)}
          >
            {opt.english}
          </button>
        ))}
      </div>
      <p className="h-6" aria-live="polite">
        {solved ? <span className="text-green-600">✅ Верно!</span> : wrong.size > 0 && <span className="text-red-600">❌ Попробуйте ещё раз</span>}
      </p>
    </div>
  );
}
