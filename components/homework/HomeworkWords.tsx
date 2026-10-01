'use client';

import { VocabItem, WordListItem } from '@/types/models';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { VocabCardList } from '@/components/topics/VocabCardList';
import { TopicPractice } from '@/components/topics/TopicPractice';
import { useUpdateVocabItem } from '@/components/topics/useTopicContents';
import { createInitialReviewState } from '@/lib/learning/review';

/** «📚 Выучите слова» in a homework: the words (from the base, so progress is shared) and practice on just them. */
export function HomeworkWords({ items, checked }: { items: WordListItem[]; checked: boolean[] }) {
  const all = useWordsStore((s) => s.items);
  const updateItem = useUpdateVocabItem();
  const words: VocabItem[] = items.map(
    (item) =>
      all.find((w) => w.id === item.wordId) ?? {
        id: item.wordId, english: item.english, translation: item.translation, category: 'homework-words', tags: [], dateAdded: '', review: createInitialReviewState(),
      }
  );
  const learned = checked.filter(Boolean).length;

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">
        Выучено: <strong>{learned} / {items.length}</strong> — слово засчитывается, когда в карточках нажмёте «✅ Знаю».
      </p>
      <VocabCardList items={words} />
      <div className="mt-4 border-t pt-4">
        <h3 className="mb-3 font-semibold">Тренировать эти слова</h3>
        <TopicPractice items={words} onUpdateItem={updateItem} />
      </div>
    </div>
  );
}
