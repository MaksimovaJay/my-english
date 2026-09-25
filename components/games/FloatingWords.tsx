'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { pickFloatingRound, DIFFICULTY_CONFIG, bubbleLayout, floatingAreaHeightPx } from '@/lib/learning/floatingWords';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

interface FloatingWordsProps {
  items: VocabItem[];
  random?: () => number;
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

  if (!round) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={cn('rounded-full border px-3 py-1 text-xs', difficulty === d && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => { setDifficulty(d); nextRound(); }}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
      <p className="mb-3 text-center text-lg font-bold">Найди слово: {round.target.translation.toUpperCase()}</p>
      <div className="relative overflow-hidden rounded-xl border" style={{ height: floatingAreaHeightPx(round.bubbles.length) }}>
        {round.bubbles.map((bubble, i) => {
          const { leftPct, topPx } = bubbleLayout(i, round.bubbles.length);
          return (
            <button
              key={bubble.id}
              className="absolute animate-float whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-sm dark:bg-blue-900"
              style={{ left: `max(4px, min(${leftPct}%, calc(100% - ${bubble.english.length * 8 + 56}px)))`, top: topPx, animationDuration: `${config.speedSeconds}s`, animationDelay: `${-i * 1.3}s` }}
              onClick={() => handleGuess(bubble.id)}
            >
              🫧 {bubble.english}
            </button>
          );
        })}
      </div>
      {result === 'correct' && <p className="mt-3 text-green-600">✅ Верно!</p>}
      {result === 'wrong' && <p className="mt-3 text-red-600">❌ Попробуй ещё</p>}
      {result && <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={nextRound}>Следующее слово</button>}
    </div>
  );
}
