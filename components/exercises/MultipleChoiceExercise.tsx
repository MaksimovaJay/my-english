'use client';

import { MultipleChoiceItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface MultipleChoiceExerciseProps {
  items: MultipleChoiceItem[];
  selected: (number | null)[];
  checked: boolean[];
  onSelect: (itemIndex: number, optionIndex: number) => void;
  onCheck: (itemIndex: number) => void;
}

export function MultipleChoiceExercise({ items, selected, checked, onSelect, onCheck }: MultipleChoiceExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border p-3">
          <p className="mb-2 font-medium">{item.question}</p>
          <div className="flex flex-wrap gap-2">
            {item.options.map((opt, oi) => {
              const isSelected = selected[i] === oi;
              const isChecked = checked[i];
              const isCorrectOption = oi === item.correctIndex;
              return (
                <button
                  key={oi}
                  type="button"
                  className={cn(
                    'rounded border px-3 py-1 text-sm',
                    isChecked && isSelected && (isCorrectOption ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'),
                    !isChecked && isSelected && 'border-violet-500 bg-violet-50'
                  )}
                  onClick={() => onSelect(i, oi)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button type="button" className="mt-2 rounded bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 px-3 py-1 text-sm text-white" onClick={() => onCheck(i)}>
            ПРОВЕРИТЬ
          </button>
        </div>
      ))}
    </div>
  );
}
