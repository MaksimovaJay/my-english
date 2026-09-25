'use client';

import { useMemo, useState } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { getDueItems, getMistakeSorted } from '@/lib/learning/reviewQueue';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { VocabItem } from '@/types/models';
import { cn } from '@/lib/utils';

type Tab = 'due' | 'mistakes';

export default function ReviewPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const wordsHydrated = useWordsStore((s) => s.hydrated);
  const phrasesHydrated = usePhrasesStore((s) => s.hydrated);
  const updateWord = useWordsStore((s) => s.update);
  const updatePhrase = usePhrasesStore((s) => s.update);
  const [tab, setTab] = useState<Tab>('due');

  const all = useMemo(() => [...words, ...phrases], [words, phrases]);
  const dueCount = useMemo(() => getDueItems(all).length, [all]);

  // The active queue is a snapshot, not a live filter of `all`. Answering a due card
  // changes its nextReviewDate, which would otherwise remove it from a live-filtered
  // "due" list mid-session: FlashcardDeck would then see items.length drop to 0 and
  // render "No cards to study yet." instead of "Done for now!" for the very last card.
  // We recompute the snapshot when the tab changes, or once hydration finishes (so we
  // don't freeze on an empty pre-hydration queue).
  const hydrated = wordsHydrated && phrasesHydrated;
  const [queue, setQueue] = useState<VocabItem[]>(() => getDueItems(all));
  const [snapshotKey, setSnapshotKey] = useState(`${tab}:${hydrated}`);
  const currentKey = `${tab}:${hydrated}`;
  if (currentKey !== snapshotKey) {
    setSnapshotKey(currentKey);
    setQueue(tab === 'due' ? getDueItems(all) : getMistakeSorted(all));
  }

  function handleUpdate(item: VocabItem) {
    if (words.some((w) => w.id === item.id)) updateWord(item);
    else updatePhrase(item);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🔄 Review</h1>
      <div className="mb-4 flex gap-4 text-sm">
        <button className={cn(tab === 'due' && 'font-bold underline')} onClick={() => setTab('due')}>
          Due today ({dueCount})
        </button>
        <button className={cn(tab === 'mistakes' && 'font-bold underline')} onClick={() => setTab('mistakes')}>
          Practice my mistakes
        </button>
      </div>
      <FlashcardDeck key={currentKey} items={queue} onUpdateItem={handleUpdate} />
    </div>
  );
}
