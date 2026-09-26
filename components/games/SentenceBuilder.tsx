'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { isSentenceCorrect, sentencePool, shuffleTokens } from '@/lib/learning/games';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useAutoAdvance } from '@/components/exercises/useAutoAdvance';
import { ListenButton } from '@/components/shared/ListenButton';
import { cn } from '@/lib/utils';

interface Chip {
  key: number;
  text: string;
}

/** «Собери предложение»: tap the shuffled words in the right order. */
export function SentenceBuilder({ items, random = Math.random }: { items: VocabItem[]; random?: () => number }) {
  const pool = useMemo(() => sentencePool(items), [items]);
  const [roundKey, setRoundKey] = useState(0);
  const task = useMemo(() => (pool.length ? pool[Math.floor(random() * pool.length)] : null), [pool, random, roundKey]);
  const chips = useMemo<Chip[]>(() => (task ? shuffleTokens(task.tokens, random).map((text, key) => ({ key, text })) : []), [task, random]);
  const [placed, setPlaced] = useState<number[]>([]); // chip keys in answer order
  const [state, setState] = useState<'playing' | 'wrong' | 'solved'>('playing');
  const advance = useAutoAdvance();

  function nextRound() {
    setPlaced([]);
    setState('playing');
    setRoundKey((k) => k + 1);
  }

  if (!task) return <p className="text-sm text-gray-500">Здесь пока нет предложений для сборки.</p>;

  function place(key: number) {
    if (state === 'solved') return;
    const next = [...placed, key];
    setPlaced(next);
    if (next.length < chips.length) {
      setState('playing');
      return;
    }
    const answer = next.map((k) => chips[k].text);
    if (isSentenceCorrect(answer, task!.tokens)) {
      setState('solved');
      recordGameCorrect();
      advance(nextRound);
    } else {
      setState('wrong');
    }
  }

  function unplace(key: number) {
    if (state === 'solved') return;
    setPlaced((p) => p.filter((k) => k !== key));
    setState('playing');
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-bold">{task.translation}</p>

      <div
        aria-label="Ваш ответ"
        className={cn(
          'flex min-h-14 w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed p-3',
          state === 'solved' && 'border-green-500',
          state === 'wrong' && 'border-red-500'
        )}
      >
        {placed.length === 0 && <span className="text-sm text-gray-400">Нажимайте на слова по порядку</span>}
        {placed.map((key) => (
          <button key={key} type="button" className="rounded-lg bg-violet-100 px-3 py-1.5 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100" onClick={() => unplace(key)}>
            {chips[key].text}
          </button>
        ))}
        {placed.length === chips.length && <span className="-ml-1 text-lg">{task.ending}</span>}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {chips.map((chip) =>
          placed.includes(chip.key) ? (
            <span key={chip.key} className="rounded-lg border border-transparent px-3 py-1.5 opacity-0" aria-hidden>
              {chip.text}
            </span>
          ) : (
            <button key={chip.key} type="button" className="rounded-lg border px-3 py-1.5" onClick={() => place(chip.key)}>
              {chip.text}
            </button>
          )
        )}
      </div>

      <div className="flex h-8 items-center gap-2" aria-live="polite">
        {state === 'solved' && (
          <>
            <span className="text-green-600">✅ Верно!</span>
            <ListenButton text={task.english} />
          </>
        )}
        {state === 'wrong' && <span className="text-red-600">❌ Попробуйте ещё раз — нажмите на слово, чтобы убрать его</span>}
      </div>
    </div>
  );
}
