'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { FloatingWords } from '@/components/games/FloatingWords';

export default function FloatingWordsPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🫧 Floating Words</h1>
      <FloatingWords items={[...words, ...phrases]} />
    </div>
  );
}
