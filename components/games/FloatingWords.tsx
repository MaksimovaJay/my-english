'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { pickFloatingRound, DIFFICULTY_CONFIG } from '@/lib/learning/floatingWords';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

interface FloatingWordsProps {
  items: VocabItem[];
  random?: () => number;
}

function hashPosition(id: string): { left: number; top: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  return { left: hash % 80, top: (hash * 7) % 70 };
}

export function FloatingWords({ items, random = Math.random }: FloatingWordsProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundKey, setRoundKey] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];
  const round = useMemo(() => pickFloatingRound(items, config.poolSize, random), [items, config.poolSize, random, roundKey]);

  function handleGuess(id: string) {
    if (!round) return;
    setResult(id === round.target.id ? 'correct' : 'wrong');
  }

  function nextRound() {
    setResult(null);
    setRoundKey((k) => k + 1);
  }

  if (!round) return <p className="text-sm text-gray-500">Add some words first.</p>;

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={cn('rounded-full border px-3 py-1 text-xs capitalize', difficulty === d && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => { setDifficulty(d); nextRound(); }}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mb-3 text-center text-lg font-bold">Найди слово: {round.target.translation.toUpperCase()}</p>
      <div className="relative h-64 overflow-hidden rounded-xl border">
        {round.bubbles.map((bubble) => {
          const { left, top } = hashPosition(bubble.id);
          return (
            <button
              key={bubble.id}
              className="absolute animate-float rounded-full bg-blue-100 px-3 py-1 text-sm dark:bg-blue-900"
              style={{ left: `${left}%`, top: `${top}%`, animationDuration: `${config.speedSeconds}s` }}
              onClick={() => handleGuess(bubble.id)}
            >
              🫧 {bubble.english}
            </button>
          );
        })}
      </div>
      {result === 'correct' && <p className="mt-3 text-green-600">✅ Correct!</p>}
      {result === 'wrong' && <p className="mt-3 text-red-600">❌ Try again</p>}
      {result && <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={nextRound}>Next word</button>}
    </div>
  );
}
