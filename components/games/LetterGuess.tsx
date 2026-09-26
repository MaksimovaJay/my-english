'use client';

import { useEffect, useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { LETTER_LIVES, isWordSolved, letterWords, maskWord } from '@/lib/learning/games';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useAutoAdvance } from '@/components/exercises/useAutoAdvance';
import { cn } from '@/lib/utils';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const REVEAL_MS = 1500;

/** «Буквы»: guess the English word letter by letter from its translation. */
export function LetterGuess({ items, random = Math.random }: { items: VocabItem[]; random?: () => number }) {
  const pool = useMemo(() => letterWords(items), [items]);
  const [roundKey, setRoundKey] = useState(0);
  const target = useMemo(() => (pool.length ? pool[Math.floor(random() * pool.length)] : null), [pool, random, roundKey]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const advance = useAutoAdvance();

  const solved = target ? isWordSolved(target.english, guessed) : false;
  const lost = misses >= LETTER_LIVES;
  const over = solved || lost;

  function nextRound() {
    setGuessed(new Set());
    setMisses(0);
    setRoundKey((k) => k + 1);
  }

  function guess(letter: string) {
    if (!target || over || guessed.has(letter)) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    if (!target.english.toLowerCase().includes(letter)) {
      const m = misses + 1;
      setMisses(m);
      if (m >= LETTER_LIVES) advance(nextRound, REVEAL_MS);
    } else if (isWordSolved(target.english, next)) {
      recordGameCorrect();
      advance(nextRound);
    }
  }

  // A physical keyboard works too.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (/^[a-z]$/.test(k)) guess(k);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!target) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-bold">{target.translation}</p>
      <p className="font-mono text-2xl tracking-wide" aria-label="Слово">
        {lost ? maskWord(target.english, new Set(ALPHABET)) : maskWord(target.english, guessed)}
      </p>
      <p className="text-sm" aria-label="Жизни">
        {'❤️'.repeat(LETTER_LIVES - misses)}
        <span className="opacity-30">{'🤍'.repeat(misses)}</span>
      </p>
      <div className="h-6" aria-live="polite">
        {solved && <span className="text-green-600">✅ Верно!</span>}
        {lost && <span className="text-red-600">Это слово: <strong>{target.english}</strong></span>}
      </div>
      <div className="grid max-w-sm grid-cols-7 gap-1.5 sm:grid-cols-9">
        {ALPHABET.map((letter) => {
          const used = guessed.has(letter);
          const hit = used && target.english.toLowerCase().includes(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={used || over}
              className={cn(
                'h-10 w-10 rounded-lg border text-base font-semibold uppercase',
                used && hit && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200',
                used && !hit && 'opacity-30'
              )}
              onClick={() => guess(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
