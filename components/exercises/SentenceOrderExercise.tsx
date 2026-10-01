'use client';

import { SentenceOrderItem } from '@/types/models';
import { sentenceChips } from '@/lib/learning/sentenceOrder';
import { isSentenceCorrect } from '@/lib/learning/games';
import { ListenButton } from '@/components/shared/ListenButton';
import { cn } from '@/lib/utils';

interface SentenceOrderExerciseProps {
  items: SentenceOrderItem[];
  /** Per item: indices (as strings) of the shuffled chips, in the order they were placed. */
  answers: string[][];
  onChange: (itemIndex: number, placed: string[]) => void;
}

/** Homework «Собери предложение»: tap the shuffled words in order; the sentence checks itself when complete. */
export function SentenceOrderExercise({ items, answers, onChange }: SentenceOrderExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const { tokens, ending, chips } = sentenceChips(item);
        const placed = answers[i] ?? [];
        const complete = placed.length === chips.length;
        const right = complete && isSentenceCorrect(placed.map((k) => chips[Number(k)]), tokens);
        return (
          <div key={i} className="rounded-lg border p-3 text-center">
            {item.translation && <p className="mb-2 font-medium">{item.translation}</p>}
            <div
              aria-label={`Ответ ${i + 1}`}
              className={cn(
                'mb-3 flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed p-2',
                complete && (right ? 'border-green-500' : 'border-red-500')
              )}
            >
              {placed.length === 0 && <span className="text-sm text-gray-400">Нажимайте на слова по порядку</span>}
              {placed.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={right}
                  className="rounded-lg bg-violet-100 px-3 py-1.5 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100"
                  onClick={() => onChange(i, placed.filter((p) => p !== k))}
                >
                  {chips[Number(k)]}
                </button>
              ))}
              {complete && <span className="-ml-1 text-lg">{ending}</span>}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {chips.map((chip, k) =>
                placed.includes(String(k)) ? null : (
                  <button key={k} type="button" className="rounded-lg border px-3 py-1.5" onClick={() => onChange(i, [...placed, String(k)])}>
                    {chip}
                  </button>
                )
              )}
            </div>
            {complete && (
              <p className="mt-2 flex items-center justify-center gap-2 text-sm" aria-live="polite">
                {right ? (
                  <>
                    <span className="text-green-600">✅ Верно!</span>
                    <ListenButton text={item.sentence} />
                  </>
                ) : (
                  <span className="text-red-600">❌ Попробуйте ещё раз — нажмите на слово, чтобы убрать его</span>
                )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
