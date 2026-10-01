'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { wordBankRound } from '@/lib/learning/wordBank';
import { recordGameCorrect } from '@/lib/learning/daily';
import { practiceWeight } from '@/lib/learning/weighting';
import { useAutoAdvance } from '@/components/exercises/useAutoAdvance';
import { WordBankChips, WordBankSentence } from '@/components/exercises/WordBankSentence';

/** «Вставь слово»: an example sentence with your word missing — pick it from the list. */
export function WordBankGame({ items, random = Math.random }: { items: VocabItem[]; random?: () => number }) {
  const [roundKey, setRoundKey] = useState(0);
  const round = useMemo(() => wordBankRound(items, random, practiceWeight), [items, random, roundKey]);
  const [answer, setAnswer] = useState('');
  const advance = useAutoAdvance();

  if (!round) return <p className="text-sm text-gray-500">Здесь пока нет примеров со словами.</p>;

  const result = !answer ? 'open' : answer.toLowerCase() === round.answer.toLowerCase() ? 'right' : 'wrong';

  function nextRound() {
    setAnswer('');
    setRoundKey((k) => k + 1);
  }

  function pick(word: string) {
    if (result === 'right') return;
    setAnswer(word);
    if (word.toLowerCase() === round!.answer.toLowerCase()) {
      recordGameCorrect();
      advance(nextRound);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <WordBankChips bank={round.bank} onPick={pick} disabled={result === 'right'} />
      <WordBankSentence text={round.text} answers={[answer]} activeBlank={0} result={result} onBlankTap={() => setAnswer('')} />
      <div className="h-6" aria-live="polite">
        {result === 'right' && <span className="text-green-600">✅ Верно!</span>}
        {result === 'wrong' && <span className="text-red-600">❌ Попробуйте ещё раз</span>}
      </div>
    </div>
  );
}
