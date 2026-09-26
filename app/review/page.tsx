'use client';

import { useMemo, useState } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { getDueItems, getMistakeSorted } from '@/lib/learning/reviewQueue';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { VocabItem } from '@/types/models';
import { cn } from '@/lib/utils';
import { TopicPractice } from '@/components/topics/TopicPractice';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { homeworkMistakes } from '@/lib/learning/homework';

type Tab = 'due' | 'mistakes' | 'all';

export default function ReviewPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const wordsHydrated = useWordsStore((s) => s.hydrated);
  const phrasesHydrated = usePhrasesStore((s) => s.hydrated);
  const updateWord = useWordsStore((s) => s.update);
  const updatePhrase = usePhrasesStore((s) => s.update);
  const [tab, setTab] = useState<Tab>('due');
  const homeworks = useHomeworkStore((s) => s.items);
  const hwMistakes = useMemo(() => homeworkMistakes(homeworks), [homeworks]);

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
    setQueue(tab === 'mistakes' ? getMistakeSorted(all) : getDueItems(all));
  }

  function handleUpdate(item: VocabItem) {
    if (words.some((w) => w.id === item.id)) updateWord(item);
    else updatePhrase(item);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🔄 Повторение</h1>
      <div className="mb-4 flex gap-4 text-sm">
        <button className={cn(tab === 'due' && 'font-bold underline')} onClick={() => setTab('due')}>
          На сегодня ({dueCount})
        </button>
        <button className={cn(tab === 'mistakes' && 'font-bold underline')} onClick={() => setTab('mistakes')}>
          Мои ошибки
        </button>
        <button className={cn(tab === 'all' && 'font-bold underline')} onClick={() => setTab('all')}>
          Все слова и игры
        </button>
      </div>
      {tab === 'all' ? (
        <TopicPractice items={all} onUpdateItem={handleUpdate} />
      ) : (
        <FlashcardDeck key={currentKey} items={queue} onUpdateItem={handleUpdate} />
      )}
      {tab === 'mistakes' && hwMistakes.length > 0 && (
        <section className="mt-8 border-t pt-4">
          <h2 className="mb-1 text-lg font-semibold">📝 Из домашки</h2>
          <p className="mb-3 text-sm text-gray-500">Задания, где была ошибка. Здесь их можно пройти ещё раз — сама домашка не изменится.</p>
          {hwMistakes.map((ex) => (
            <div key={ex.id} className="card mb-4 p-4">
              <ExerciseRunner exercise={ex} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
