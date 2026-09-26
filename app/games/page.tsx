'use client';

import { useState } from 'react';
import { MatchingGame } from '@/components/games/MatchingGame';
import { FloatingWords } from '@/components/games/FloatingWords';
import { SentenceBuilder } from '@/components/games/SentenceBuilder';
import { LetterGuess } from '@/components/games/LetterGuess';
import { TimedQuiz } from '@/components/games/TimedQuiz';
import { useTopicContents } from '@/components/topics/useTopicContents';
import { cn } from '@/lib/utils';

type Game = 'matching' | 'floating' | 'sentence' | 'letters' | 'timed';

const GAMES: { id: Game; label: string }[] = [
  { id: 'matching', label: '🔗 Найди пару' },
  { id: 'floating', label: '🫧 Лови слова' },
  { id: 'sentence', label: '🧩 Собери предложение' },
  { id: 'letters', label: '🔤 Буквы' },
  { id: 'timed', label: '⏱ На время' },
];

export default function GamesPage() {
  const contents = useTopicContents().filter((c) => c.words.length + c.phrases.length > 0);
  const [game, setGame] = useState<Game>('matching');
  const [topicId, setTopicId] = useState('all');
  const [round, setRound] = useState(0);

  const selected = contents.filter((c) => topicId === 'all' || c.topic.id === topicId);
  const items = selected.flatMap((c) => [...c.words, ...c.phrases]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold">🎮 Игры</h1>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn('rounded-full border px-4 py-1.5 text-sm', game === g.id && 'border-transparent bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 text-white')}
            onClick={() => setGame(g.id)}
          >
            {g.label}
          </button>
        ))}
        <select
          aria-label="Слова для игры"
          className="ml-auto rounded border bg-transparent px-2 py-1.5 text-sm"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
        >
          <option value="all">Все слова</option>
          {contents.map((c) => (
            <option key={c.topic.id} value={c.topic.id}>{c.topic.emoji} {c.topic.title}</option>
          ))}
        </select>
      </div>
      {/* key: restart the game with a fresh round when the word set changes */}
      {game === 'matching' && (
        <>
          <MatchingGame key={`${topicId}-${round}`} items={items} />
          <div className="mt-6 text-center">
            <button type="button" className="rounded bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 px-4 py-1.5 text-sm text-white" onClick={() => setRound((r) => r + 1)}>
              Новый раунд
            </button>
          </div>
        </>
      )}
      {game === 'floating' && <FloatingWords key={topicId} items={items} />}
      {game === 'sentence' && <SentenceBuilder key={topicId} items={items} />}
      {game === 'letters' && <LetterGuess key={topicId} items={items} />}
      {game === 'timed' && <TimedQuiz key={topicId} items={items} />}
    </div>
  );
}
