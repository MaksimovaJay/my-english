'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { isAnswerCorrect } from '@/lib/learning/checkAnswer';
import { diffTyped } from '@/lib/learning/typingCheck';

interface TypingPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

export function TypingPractice({ items, random = Math.random }: TypingPracticeProps) {
  const [roundKey, setRoundKey] = useState(0);
  const target = useMemo(() => items[Math.floor(random() * items.length)], [items, random, roundKey]);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  function nextRound() {
    setInput('');
    setChecked(false);
    setRoundKey((k) => k + 1);
  }

  if (!target) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;

  const correct = isAnswerCorrect(input, [target.english]);
  const diff = diffTyped(input, target.english);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold">{target.translation}</p>
      <label className="flex flex-col gap-1 text-sm">
        Напишите по-английски
        <input
          className="rounded border px-2 py-1 text-center"
          value={input}
          onChange={(e) => { setInput(e.target.value); setChecked(false); }}
        />
      </label>
      {checked && (
        <p className="flex gap-0.5 font-mono text-lg">
          {diff.map((d, i) => <span key={i} className={d.correct ? 'text-green-600' : 'text-red-600'}>{d.char}</span>)}
        </p>
      )}
      <button className="rounded bg-blue-600 px-4 py-1 text-sm text-white" onClick={() => setChecked(true)}>Проверить</button>
      {checked && (correct ? <p className="text-green-600">✅ Верно!</p> : <p className="text-red-600">❌ Неверно — правильно: <strong>{target.english}</strong></p>)}
      {checked && <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={nextRound}>Следующее слово</button>}
    </div>
  );
}
