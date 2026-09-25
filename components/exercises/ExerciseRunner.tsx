'use client';

import { useState } from 'react';
import { Exercise, FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from '@/lib/learning/exerciseProgress';
import { FillBlankExercise } from './FillBlankExercise';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';

interface ExerciseRunnerProps {
  exercise: Exercise;
  onComplete?: (score: { correct: number; total: number }) => void;
}

export function ExerciseRunner({ exercise, onComplete }: ExerciseRunnerProps) {
  const isFillBlank = exercise.type === 'fill-blank';
  const fillItems = isFillBlank ? (exercise.items as FillBlankItem[]) : [];
  const mcItems = !isFillBlank ? (exercise.items as MultipleChoiceItem[]) : [];
  const itemCount = exercise.items.length;

  const [fillAnswers, setFillAnswers] = useState<string[][]>(() => initFillBlankAnswers(fillItems));
  const [mcAnswers, setMcAnswers] = useState<(number | null)[]>(() => initMultipleChoiceAnswers(mcItems));
  const [checked, setChecked] = useState<boolean[]>(() => exercise.items.map(() => false));
  const [showCorrect, setShowCorrect] = useState<boolean[]>(() => exercise.items.map(() => false));

  function handleCheck(i: number) {
    const wasComplete = checked.every(Boolean);
    const nextChecked = checked.map((v, idx) => (idx === i ? true : v));
    setChecked(nextChecked);
    if (!wasComplete && nextChecked.every(Boolean) && onComplete) {
      const score = isFillBlank ? scoreFillBlank(fillItems, fillAnswers) : scoreMultipleChoice(mcItems, mcAnswers);
      onComplete(score);
    }
  }

  function toggleShowCorrect(i: number) {
    setShowCorrect((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div>
      <p className="mb-3 font-medium">{exercise.instruction}</p>
      {isFillBlank ? (
        <FillBlankExercise
          items={fillItems}
          userAnswers={fillAnswers}
          checked={checked}
          onAnswerChange={(i, bi, value) =>
            setFillAnswers((prev) => prev.map((a, idx) => (idx === i ? a.map((b, bidx) => (bidx === bi ? value : b)) : a)))
          }
          onCheck={handleCheck}
        />
      ) : (
        <MultipleChoiceExercise
          items={mcItems}
          selected={mcAnswers}
          checked={checked}
          onSelect={(i, oi) => setMcAnswers((prev) => prev.map((v, idx) => (idx === i ? oi : v)))}
          onCheck={handleCheck}
        />
      )}
      <div className="mt-2 flex flex-col gap-2">
        {Array.from({ length: itemCount }).map(
          (_, i) =>
            checked[i] && (
              <div key={i} className="flex flex-col gap-1 text-xs text-gray-500">
                <button type="button" className="w-fit underline" onClick={() => toggleShowCorrect(i)}>
                  Показать правильный ответ
                </button>
                {showCorrect[i] && (
                  <p>
                    Правильный ответ:{' '}
                    <strong>
                      {isFillBlank ? fillItems[i].blanks.map((b) => b[0]).join(', ') : mcItems[i].options[mcItems[i].correctIndex]}
                    </strong>
                  </p>
                )}
              </div>
            )
        )}
      </div>
      {exercise.explanation && checked.some(Boolean) && <p className="mt-2 text-sm text-gray-500">{exercise.explanation}</p>}
    </div>
  );
}
