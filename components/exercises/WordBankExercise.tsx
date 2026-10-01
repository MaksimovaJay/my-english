'use client';

import { useState } from 'react';
import { FillBlankItem } from '@/types/models';
import { isFillBlankItemCorrect } from '@/lib/learning/checkAnswer';
import { WordBankChips, WordBankSentence } from './WordBankSentence';

interface WordBankExerciseProps {
  items: FillBlankItem[];
  bank: string[];
  answers: string[][];
  onChange: (itemIndex: number, answers: string[]) => void;
}

/** Homework «Вставь слово»: one list of words for all sentences; a sentence checks itself once its blanks are filled. */
export function WordBankExercise({ items, bank, answers, onChange }: WordBankExerciseProps) {
  const [active, setActive] = useState<{ item: number; blank: number } | null>(null);

  const resultOf = (i: number) => {
    const a = answers[i] ?? [];
    if (!a.every((x) => x)) return 'open' as const;
    return isFillBlankItemCorrect(items[i], a) ? ('right' as const) : ('wrong' as const);
  };

  function firstEmpty(): { item: number; blank: number } | null {
    for (let i = 0; i < items.length; i++) {
      if (resultOf(i) === 'right') continue;
      const b = (answers[i] ?? []).findIndex((x) => !x);
      if (b >= 0) return { item: i, blank: b };
    }
    return null;
  }

  function pick(word: string) {
    const target = active && !answers[active.item]?.[active.blank] ? active : firstEmpty();
    if (!target) return;
    const next = [...(answers[target.item] ?? [])];
    next[target.blank] = word;
    onChange(target.item, next);
    setActive(null);
  }

  function tapBlank(item: number, blank: number) {
    const current = answers[item] ?? [];
    if (current[blank]) {
      onChange(item, current.map((x, b) => (b === blank ? '' : x)));
    }
    setActive({ item, blank });
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 bg-white/90 px-1 py-1 backdrop-blur dark:bg-[#07060b]/90">
        <WordBankChips bank={bank} onPick={pick} />
        <p className="mt-1 text-center text-xs text-gray-500">Нажмите на пропуск, потом на слово. Нажмите на вставленное слово, чтобы убрать его.</p>
      </div>
      {items.map((item, i) => {
        const result = resultOf(i);
        return (
          <div key={i} className="rounded-lg border p-3">
            <WordBankSentence
              label={`Предложение ${i + 1}`}
              text={`${i + 1}. ${item.text}`}
              answers={answers[i] ?? []}
              activeBlank={active?.item === i ? active.blank : null}
              result={result}
              onBlankTap={(b) => tapBlank(i, b)}
            />
            {result === 'right' && <p className="mt-1 text-sm text-green-600">✅ Верно!</p>}
            {result === 'wrong' && <p className="mt-1 text-sm text-red-600">❌ Попробуйте ещё раз — нажмите на слово, чтобы убрать его</p>}
          </div>
        );
      })}
    </div>
  );
}
