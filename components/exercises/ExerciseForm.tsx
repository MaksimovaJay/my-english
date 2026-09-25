'use client';

import { useState } from 'react';
import { Exercise, FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ExerciseFormProps {
  onSubmit: (exercise: Exercise) => void;
}

export function ExerciseForm({ onSubmit }: ExerciseFormProps) {
  const [type, setType] = useState<'fill-blank' | 'multiple-choice'>('fill-blank');
  const [instruction, setInstruction] = useState('');
  const [text, setText] = useState('');
  const [acceptedAnswers, setAcceptedAnswers] = useState('');
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setInstruction('');
    setText('');
    setAcceptedAnswers('');
    setQuestion('');
    setOptionsText('');
    setCorrectIndex(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!instruction.trim()) {
      setError('Instruction is required.');
      return;
    }
    if (type === 'fill-blank') {
      const blankCount = (text.match(/___/g) ?? []).length;
      if (blankCount !== 1 || !acceptedAnswers.trim()) {
        setError('Sentence must contain exactly one ___ blank and at least one accepted answer.');
        return;
      }
      const item: FillBlankItem = {
        text: text.trim(),
        blanks: [acceptedAnswers.split(',').map((a) => a.trim()).filter(Boolean)],
      };
      onSubmit({ id: generateId(), type, instruction: instruction.trim(), items: [item] });
    } else {
      const options = optionsText.split(',').map((o) => o.trim()).filter(Boolean);
      if (!question.trim() || options.length < 2) {
        setError('Question and at least 2 comma-separated options are required.');
        return;
      }
      if (correctIndex < 0 || correctIndex >= options.length) {
        setError('Correct option index must be a valid index into the options.');
        return;
      }
      const item: MultipleChoiceItem = { question: question.trim(), options, correctIndex };
      onSubmit({ id: generateId(), type, instruction: instruction.trim(), items: [item] });
    }
    setError(null);
    reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={cn('rounded-full border px-3 py-1', type === 'fill-blank' && 'border-blue-600 bg-blue-600 text-white')}
          onClick={() => setType('fill-blank')}
        >
          Fill in the blank
        </button>
        <button
          type="button"
          className={cn('rounded-full border px-3 py-1', type === 'multiple-choice' && 'border-blue-600 bg-blue-600 text-white')}
          onClick={() => setType('multiple-choice')}
        >
          Multiple choice
        </button>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Instruction
        <input className="rounded border px-2 py-1" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
      </label>
      {type === 'fill-blank' ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Sentence (use ___ for the blank)
            <input
              className="rounded border px-2 py-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="The book is ___ the table."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Accepted answers (comma-separated)
            <input
              className="rounded border px-2 py-1"
              value={acceptedAnswers}
              onChange={(e) => setAcceptedAnswers(e.target.value)}
              placeholder="on, on top of"
            />
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Question
            <input className="rounded border px-2 py-1" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Options (comma-separated)
            <input
              className="rounded border px-2 py-1"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder="am, is, are"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Correct option index (0-based)
            <input
              type="number"
              min={0}
              className="rounded border px-2 py-1"
              value={correctIndex}
              onChange={(e) => setCorrectIndex(Number(e.target.value))}
            />
          </label>
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
        Save
      </button>
    </form>
  );
}
