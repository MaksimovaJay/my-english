'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { pickFloatingRound, DIFFICULTY_CONFIG, bubbleLayout, floatingAreaHeightPx } from '@/lib/learning/floatingWords';
import { cn } from '@/lib/utils';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useAutoAdvance } from '@/components/exercises/useAutoAdvance';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

interface FloatingWordsProps {
  items: VocabItem[];
  random?: () => number;
}

export function FloatingWords({ items, random = Math.random }: FloatingWordsProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundKey, setRoundKey] = useState(0);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const advance = useAutoAdvance();

  const config = DIFFICULTY_CONFIG[difficulty];
  const round = useMemo(() => pickFloatingRound(items, config.poolSize, random), [items, config.poolSize, random, roundKey]);

  function nextRound() {
    setWrong(new Set());
    setSolved(false);
    setRoundKey((k) => k + 1);
  }

  function handleGuess(id: string) {
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
    <div>
      <div className="mb-3 flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={cn('rounded-full border px-3 py-1 text-xs', difficulty === d && 'border-transparent bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 text-white')}
            onClick={() => { setDifficulty(d); nextRound(); }}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
      <p className="text-center text-lg font-bold">Найди слово: {round.target.translation.toUpperCase()}</p>
      {/* Feedback sits above the field so it is visible without scrolling on a phone. */}
      <p className="mb-2 h-6 text-center" aria-live="polite">
        {solved ? <span className="text-green-600">✅ Верно!</span> : wrong.size > 0 && <span className="text-red-600">❌ Попробуйте ещё раз</span>}
      </p>
      <div className="relative overflow-hidden rounded-xl border" style={{ height: floatingAreaHeightPx(round.bubbles.length) }}>
        {round.bubbles.map((bubble, i) => {
          const { leftPct, topPx } = bubbleLayout(i, round.bubbles.length);
          return (
            <button
              key={bubble.id}
              className={cn(
                'absolute animate-float whitespace-nowrap rounded-full bg-violet-100 px-3 py-1 text-sm dark:bg-violet-500/25',
                wrong.has(bubble.id) && 'bg-red-100 opacity-50 dark:bg-red-500/25',
                solved && bubble.id === round.target.id && 'bg-green-100 ring-2 ring-green-500 dark:bg-green-500/25'
              )}
              style={{ left: `max(4px, min(${leftPct}%, calc(100% - ${bubble.english.length * 8 + 56}px)))`, top: topPx, animationDuration: `${config.speedSeconds}s`, animationDelay: `${-i * 1.3}s` }}
              onClick={() => handleGuess(bubble.id)}
            >
              🫧 {bubble.english}
            </button>
          );
        })}
      </div>
    </div>
  );
}
