'use client';

import { cn } from '@/lib/utils';

interface WordBankSentenceProps {
  text: string; // «___» marks each blank
  answers: string[];
  activeBlank: number | null;
  result: 'open' | 'right' | 'wrong';
  onBlankTap: (blankIndex: number) => void;
  label?: string;
}

/** A sentence with tappable blanks: tap a blank to choose it (or to take its word back). */
export function WordBankSentence({ text, answers, activeBlank, result, onBlankTap, label }: WordBankSentenceProps) {
  const parts = text.split('___');
  return (
    <p className="flex flex-wrap items-center gap-x-1 gap-y-2 text-lg leading-relaxed" aria-label={label}>
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {part && <span>{part}</span>}
          {i < parts.length - 1 && (
            <button
              type="button"
              aria-label={`Пропуск ${i + 1}`}
              disabled={result === 'right'}
              onClick={() => onBlankTap(i)}
              className={cn(
                'min-w-16 rounded-lg border-b-2 px-2 py-0.5 text-center',
                answers[i] ? 'bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100' : 'border-dashed text-gray-400',
                activeBlank === i && !answers[i] && 'border-pink-500 ring-2 ring-pink-400/50',
                result === 'right' && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200',
                result === 'wrong' && 'border-red-500'
              )}
            >
              {answers[i] || '…'}
            </button>
          )}
        </span>
      ))}
    </p>
  );
}

/** The list of words to pick from. */
export function WordBankChips({ bank, onPick, disabled }: { bank: string[]; onPick: (word: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 rounded-xl border border-dashed p-3" aria-label="Слова">
      {bank.map((word) => (
        <button key={word} type="button" disabled={disabled} className="rounded-full border px-3 py-1.5 font-medium" onClick={() => onPick(word)}>
          {word}
        </button>
      ))}
    </div>
  );
}
