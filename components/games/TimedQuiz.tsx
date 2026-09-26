'use client';

import { useEffect, useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { timedQuestion } from '@/lib/learning/games';
import { recordGameCorrect } from '@/lib/learning/daily';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { useAutoAdvance } from '@/components/exercises/useAutoAdvance';
import { cn } from '@/lib/utils';

export const TIMED_SECONDS = 60;
const WRONG_FLASH_MS = 300;

/** «На время»: as many right translations as possible in 60 seconds. */
export function TimedQuiz({ items, random = Math.random }: { items: VocabItem[]; random?: () => number }) {
  const [phase, setPhase] = useState<'ready' | 'running' | 'over'>('ready');
  const [timeLeft, setTimeLeft] = useState(TIMED_SECONDS);
  const [score, setScore] = useState(0);
  const [qKey, setQKey] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const best = useSettingsStore((s) => s.bests.timed ?? 0);
  const setBest = useSettingsStore((s) => s.setBest);
  const advance = useAutoAdvance();
  const question = useMemo(() => timedQuestion(items, random), [items, random, qKey]);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && timeLeft <= 0) {
      setPhase('over');
      setNewRecord(setBest('timed', score));
    }
  }, [phase, timeLeft, score, setBest]);

  if (!question) return <p className="text-sm text-gray-500">Нужно хотя бы 2 слова.</p>;

  function start() {
    setScore(0);
    setTimeLeft(TIMED_SECONDS);
    setWrong(null);
    setNewRecord(false);
    setQKey((k) => k + 1);
    setPhase('running');
  }

  function answer(option: string) {
    if (phase !== 'running' || wrong) return;
    if (option === question!.target.translation) {
      setScore((s) => s + 1);
      recordGameCorrect();
      setQKey((k) => k + 1);
    } else {
      setWrong(option);
      advance(() => {
        setWrong(null);
        setQKey((k) => k + 1);
      }, WRONG_FLASH_MS);
    }
  }

  if (phase === 'ready' || phase === 'over') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        {phase === 'over' ? (
          <>
            <p className="text-lg">Время вышло!</p>
            <p className="text-4xl font-extrabold text-gradient">{score}</p>
            <p className="text-sm text-gray-500">{newRecord ? '🏆 Новый рекорд!' : `Рекорд: ${best}`}</p>
          </>
        ) : (
          <>
            <p className="text-lg">60 секунд — выбирайте правильный перевод как можно быстрее.</p>
            {best > 0 && <p className="text-sm text-gray-500">🏆 Рекорд: {best}</p>}
          </>
        )}
        <button
          type="button"
          className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2 font-semibold text-white shadow-md shadow-pink-500/20 hover:brightness-110"
          onClick={start}
        >
          {phase === 'over' ? 'Ещё раз' : 'Старт'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex w-full max-w-sm items-center justify-between text-sm">
        <span aria-label="Осталось секунд">⏱ {timeLeft}</span>
        <span aria-label="Очки">⭐ {score}</span>
      </div>
      <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-violet-100 dark:bg-violet-500/15">
        <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all" style={{ width: `${(timeLeft / TIMED_SECONDS) * 100}%` }} />
      </div>
      <p className="text-3xl font-bold">{question.target.english}</p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={cn('rounded-xl border px-3 py-3', wrong === opt && 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200')}
            onClick={() => answer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
