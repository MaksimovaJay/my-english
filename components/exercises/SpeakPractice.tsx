'use client';

import { useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { VocabItem } from '@/types/models';
import { browserRecognizer, isRecognitionSupported, isSpokenMatch, Recognizer } from '@/lib/pronunciation/recognize';
import { recordGameCorrect } from '@/lib/learning/daily';
import { ListenButton } from '@/components/shared/ListenButton';
import { useAutoAdvance } from './useAutoAdvance';
import { cn } from '@/lib/utils';

interface SpeakPracticeProps {
  items: VocabItem[];
  random?: () => number;
  recognizer?: Recognizer;
  supported?: boolean;
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Разрешите доступ к микрофону для этого сайта и попробуйте ещё раз.',
  'no-speech': 'Ничего не слышно — попробуйте ещё раз, чуть громче.',
  failed: 'Не получилось распознать. Попробуйте ещё раз.',
};

/** «🎤 Скажи»: say the word or phrase; speech recognition checks it. */
export function SpeakPractice({ items, random = Math.random, recognizer = browserRecognizer, supported }: SpeakPracticeProps) {
  const [roundKey, setRoundKey] = useState(0);
  const target = useMemo(() => (items.length ? items[Math.floor(random() * items.length)] : null), [items, random, roundKey]);
  const [state, setState] = useState<'idle' | 'listening' | 'right' | 'wrong' | 'error'>('idle');
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const advance = useAutoAdvance();
  const canRecognize = supported ?? isRecognitionSupported();

  function nextRound() {
    setState('idle');
    setHeard('');
    setRoundKey((k) => k + 1);
  }

  if (!target) return <p className="text-sm text-gray-500">Здесь пока нет слов.</p>;
  if (!canRecognize) {
    return <p className="text-sm text-gray-500">Этот браузер не умеет распознавать речь. Попробуйте Chrome или Safari.</p>;
  }

  async function listen() {
    setState('listening');
    try {
      const alternatives = await recognizer('en-US');
      if (isSpokenMatch(alternatives, target!.english)) {
        setState('right');
        recordGameCorrect();
        advance(nextRound);
      } else {
        setHeard(alternatives[0] ?? '');
        setState('wrong');
      }
    } catch (err) {
      setError(ERRORS[err instanceof Error ? err.message : 'failed'] ?? ERRORS.failed);
      setState('error');
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold">{target.english}</p>
        <ListenButton text={target.english} />
      </div>
      <p className="text-gray-500">
        {target.translation}
        {target.ruPronunciation && <span className="ml-2 text-sm">[{target.ruPronunciation}]</span>}
      </p>
      <button
        type="button"
        aria-label="Сказать"
        disabled={state === 'listening' || state === 'right'}
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition',
          state === 'listening' && 'animate-pulse'
        )}
        onClick={() => void listen()}
      >
        <Mic size={36} />
      </button>
      <div className="min-h-12 text-sm" aria-live="polite">
        {state === 'idle' && <span className="text-gray-500">Нажмите на микрофон и скажите по-английски</span>}
        {state === 'listening' && <span className="text-gray-500">Слушаю…</span>}
        {state === 'right' && <span className="text-green-600">✅ Верно!</span>}
        {state === 'wrong' && (
          <>
            <p className="text-red-600">❌ Попробуйте ещё раз</p>
            <p className="text-gray-500">Распознано: «{heard}»</p>
          </>
        )}
        {state === 'error' && <span className="text-red-600">{error}</span>}
      </div>
      {(state === 'wrong' || state === 'error') && (
        <button type="button" className="text-sm text-gray-500 underline" onClick={nextRound}>
          Пропустить →
        </button>
      )}
    </div>
  );
}
