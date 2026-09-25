'use client';

import { FillBlankItem } from '@/types/models';
import { isAnswerCorrect } from '@/lib/learning/checkAnswer';
import { cn } from '@/lib/utils';

interface FillBlankExerciseProps {
  items: FillBlankItem[];
  userAnswers: string[][];
  checked: boolean[];
  onAnswerChange: (itemIndex: number, blankIndex: number, value: string) => void;
  onCheck: (itemIndex: number) => void;
}

/** Wide enough for the longest accepted answer: a word gets a short field, a whole question a long one. */
export function blankWidthCh(accepted: string[] = []): number {
  const longest = Math.max(0, ...accepted.map((a) => a.length));
  return Math.max(8, longest + 3);
}

export function FillBlankExercise({ items, userAnswers, checked, onAnswerChange, onCheck }: FillBlankExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const parts = item.text.split('___');
        const isChecked = checked[i];
        return (
          <div key={i} className="rounded-lg border p-3">
            <p className="flex flex-wrap items-center gap-1">
              {parts.map((part, pi) => (
                <span key={pi} className="flex items-center gap-1">
                  <span>{part}</span>
                  {pi < parts.length - 1 && (
                    <input
                      aria-label={`blank-${i}-${pi}`}
                      style={{ width: `${blankWidthCh(item.blanks[pi])}ch` }}
                      className={cn(
                        'max-w-full border-b bg-transparent px-1 outline-none',
                        isChecked
                          ? isAnswerCorrect(userAnswers[i]?.[pi] ?? '', item.blanks[pi] ?? [])
                            ? 'border-green-500 text-green-600'
                            : 'border-red-500 text-red-600'
                          : 'border-gray-400'
                      )}
                      value={userAnswers[i]?.[pi] ?? ''}
                      onChange={(e) => onAnswerChange(i, pi, e.target.value)}
                    />
                  )}
                </span>
              ))}
            </p>
            <button type="button" className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => onCheck(i)}>
              ПРОВЕРИТЬ
            </button>
          </div>
        );
      })}
    </div>
  );
}
