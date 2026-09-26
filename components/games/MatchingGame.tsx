'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { buildMatchingRound, isMatch } from '@/lib/learning/matchingGame';
import { cn } from '@/lib/utils';
import { recordGameCorrect } from '@/lib/learning/daily';

interface MatchingGameProps {
  items: VocabItem[];
  count?: number;
  random?: () => number;
}

export function MatchingGame({ items, count = 5, random = Math.random }: MatchingGameProps) {
  const { leftItems, rightItems } = useMemo(() => buildMatchingRound(items, count, random), [items, count, random]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongRightId, setWrongRightId] = useState<string | null>(null);

  function handleLeftClick(id: string) {
    if (matched.has(id)) return;
    setSelectedLeft(id);
    setWrongRightId(null);
  }

  function handleRightClick(rightItem: VocabItem) {
    if (!selectedLeft || matched.has(rightItem.id)) return;
    const leftItem = leftItems.find((i) => i.id === selectedLeft)!;
    if (isMatch(leftItem, rightItem)) {
      setMatched((prev) => new Set(prev).add(leftItem.id));
      setSelectedLeft(null);
      recordGameCorrect();
    } else {
      setWrongRightId(rightItem.id);
      setSelectedLeft(null);
    }
  }

  const done = leftItems.length > 0 && matched.size === leftItems.length;

  if (done) return <p className="text-lg font-bold">{matched.size} / {leftItems.length} верно 🎉</p>;

  return (
    <div className="flex justify-center gap-8">
      <div className="flex flex-col gap-2">
        {leftItems.map((item) => (
          <button
            key={item.id}
            disabled={matched.has(item.id)}
            className={cn('rounded border px-3 py-1 text-sm', selectedLeft === item.id && 'border-violet-600 bg-violet-50 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100', matched.has(item.id) && 'opacity-40')}
            onClick={() => handleLeftClick(item.id)}
          >
            {item.english}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {rightItems.map((item) => (
          <button
            key={item.id}
            disabled={matched.has(item.id)}
            className={cn('rounded border px-3 py-1 text-sm', wrongRightId === item.id && 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200', matched.has(item.id) && 'opacity-40')}
            onClick={() => handleRightClick(item)}
          >
            {item.translation}
          </button>
        ))}
      </div>
    </div>
  );
}
