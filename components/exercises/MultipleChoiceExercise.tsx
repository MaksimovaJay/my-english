'use client';

import { MultipleChoiceItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface MultipleChoiceExerciseProps {
  items: MultipleChoiceItem[];
  selected: (number | null)[];
  checked: boolean[];
  /** Tapping an option answers the item right away (no separate check button). */
  onAnswer: (itemIndex: number, optionIndex: number) => void;
}

export function MultipleChoiceExercise({ items, selected, checked, onAnswer }: MultipleChoiceExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isChecked = checked[i];
        const solved = isChecked && selected[i] === item.correctIndex;
        return (
          <div key={i} className="rounded-lg border p-3">
            <p className="mb-2 font-medium">{item.question}</p>
            <div className="flex flex-wrap gap-2">
              {item.options.map((opt, oi) => {
                const isSelected = selected[i] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-sm transition',
                      isChecked && isSelected && oi === item.correctIndex && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200',
                      isChecked && isSelected && oi !== item.correctIndex && 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                    )}
                    onClick={() => {
                      if (!solved) onAnswer(i, oi);
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {isChecked && (
              <p className="mt-2 text-sm" aria-live="polite">
                {solved ? <span className="text-green-600">✅ Верно!</span> : <span className="text-red-600">❌ Попробуйте ещё раз</span>}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
