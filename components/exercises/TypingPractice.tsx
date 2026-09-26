'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { isAnswerCorrect } from '@/lib/learning/checkAnswer';
import { diffTyped } from '@/lib/learning/typingCheck';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useAutoAdvance } from './useAutoAdvance';

interface TypingPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

/** After this many wrong tries the correct spelling is shown. */
const MISSES_BEFORE_HINT = 2;

export function TypingPractice({ items, random = Math.random }: TypingPracticeProps) {
  const [roundKey, setRoundKey] = useState(0);
  const target = useMemo(() => items[Math.floor(random() * items.length)], [items, random, roundKey]);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const advance = useAutoAdvance();

  function nextRound() {
    setInput('');
    setChecked(false);
    setMisses(0);
    setSolved(false);
    setRoundKey((k) => k + 1);
  }

  if (!target) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (solved || !input.trim()) return;
    setChecked(true);
    if (isAnswerCorrect(input, [target.english])) {
      setSolved(true);
      recordGameCorrect();
      advance(nextRound);
    } else {
      setMisses((m) => m + 1);
    }
  }

  const diff = diffTyped(input, target.english);

  return (
    <form onSubmit={check} className="flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold">{target.translation}</p>
      <label className="flex flex-col gap-1 text-sm">
        Напишите по-английски
        <input
          className="rounded border bg-transparent px-2 py-1 text-center text-base"
          value={input}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => { setInput(e.target.value); setChecked(false); }}
        />
      </label>
      {checked && !solved && (
        <p className="flex gap-0.5 font-mono text-lg">
          {diff.map((d, i) => <span key={i} className={d.correct ? 'text-green-600' : 'text-red-600'}>{d.char}</span>)}
        </p>
      )}
      <button
        type="submit"
        disabled={solved}
        className="rounded bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-1 text-sm text-white shadow-md shadow-pink-500/20 hover:brightness-110 disabled:opacity-50"
      >
        Проверить
      </button>
      <div aria-live="polite" className="min-h-6">
        {solved && <p className="text-green-600">✅ Верно!</p>}
        {!solved && checked && <p className="text-red-600">❌ Попробуйте ещё раз</p>}
        {!solved && misses >= MISSES_BEFORE_HINT && (
          <p className="text-sm text-gray-500">Правильно: <strong>{target.english}</strong></p>
        )}
      </div>
    </form>
  );
}
