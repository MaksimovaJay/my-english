'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { buildListeningRound } from '@/lib/learning/listeningPractice';
import { ListenButton } from '@/components/shared/ListenButton';
import { cn } from '@/lib/utils';

interface ListeningPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

export function ListeningPractice({ items, random = Math.random }: ListeningPracticeProps) {
  const [roundKey, setRoundKey] = useState(0);
  const round = useMemo(() => buildListeningRound(items, random), [items, random, roundKey]);
  const [selected, setSelected] = useState<string | null>(null);

  function nextRound() {
    setSelected(null);
    setRoundKey((k) => k + 1);
  }

  if (!round) return <p className="text-sm text-gray-500">Add some words first.</p>;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ListenButton text={round.target.english} className="scale-150" />
      <div className="flex gap-2">
        {round.options.map((opt) => (
          <button
            key={opt.id}
            className={cn(
              'rounded border px-3 py-2 text-sm',
              selected && opt.id === round.target.id && 'border-green-500 bg-green-50',
              selected === opt.id && opt.id !== round.target.id && 'border-red-500 bg-red-50'
            )}
            onClick={() => setSelected(opt.id)}
          >
            {opt.english}
          </button>
        ))}
      </div>
      {selected && (selected === round.target.id ? <p className="text-green-600">✅ Correct!</p> : <p className="text-red-600">❌ Incorrect</p>)}
      {selected && <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={nextRound}>Next word</button>}
    </div>
  );
}
