'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { MatchingGame } from '@/components/games/MatchingGame';

export default function MatchingGamePage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🔗 Matching Game</h1>
      <MatchingGame items={[...words, ...phrases]} />
    </div>
  );
}
