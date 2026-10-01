'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { TopicDialog } from '@/components/topics/TopicDialog';
import { useTopicsStore } from '@/lib/storage/topicsStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { BackLink } from '@/components/shared/BackLink';
import { useRemoveVocabItem, useTopicContents, useUpdateVocabItem } from '@/components/topics/useTopicContents';
import { EditVocabDialog } from '@/components/topics/EditVocabDialog';
import { VocabItem } from '@/types/models';
import { VocabCardList } from '@/components/topics/VocabCardList';
import { TopicPractice } from '@/components/topics/TopicPractice';
import { topicCountsLine } from '@/components/topics/TopicCard';
import { GrammarTopicCard } from '@/components/grammar/GrammarTopicCard';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';
import { cn } from '@/lib/utils';

type Tab = 'words' | 'phrases' | 'rule' | 'exercises';

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const content = useTopicContents().find((c) => c.topic.id === id);
  const updateItem = useUpdateVocabItem();
  const [selected, setSelected] = useState<Tab | null>(null);
  const removeItem = useRemoveVocabItem();
  const [editing, setEditing] = useState<VocabItem | null>(null);
  const [editingTopic, setEditingTopic] = useState(false);
  const router = useRouter();
  const topicDocs = useTopicsStore((s) => s.items);

  if (!content) {
    return (
      <div>
        <p className="text-sm text-gray-500">Тема не найдена.</p>
        <Link href="/topics" className="text-sm text-violet-600 underline">Ко всем темам</Link>
      </div>
    );
  }

  const { topic, words, phrases, grammar, exerciseCount } = content;
  const practiceItems = [...words, ...phrases];
  const tabs = ([
    { id: 'words', label: `Слова (${words.length})`, show: words.length > 0 },
    { id: 'phrases', label: `Фразы (${phrases.length})`, show: phrases.length > 0 },
    { id: 'rule', label: 'Правило', show: grammar.length > 0 },
    { id: 'exercises', label: `Упражнения (${exerciseCount})`, show: exerciseCount > 0 },
  ] as { id: Tab; label: string; show: boolean }[]).filter((t) => t.show);
  const tab = selected && tabs.some((t) => t.id === selected) ? selected : tabs[0]?.id;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/topics" label="Все темы" />
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">{topic.emoji} {topic.title}</h1>
        {topic.id !== 'other' && (
          <button type="button" aria-label="Изменить тему" className="rounded-full p-1.5 text-gray-400 hover:text-violet-600" onClick={() => setEditingTopic(true)}>
            <Pencil size={16} />
          </button>
        )}
      </div>
      {editingTopic && (
        <TopicDialog
          heading="✏️ Изменить тему"
          initial={topic}
          itemCount={words.length + phrases.length}
          onClose={() => setEditingTopic(false)}
          onSave={(values) => {
            const existing = topicDocs.find((d) => d.id === topic.id);
            const store = useTopicsStore.getState();
            if (existing) store.update({ ...existing, ...values });
            else store.add({ id: topic.id, ...values });
            setEditingTopic(false);
          }}
          onDelete={
            topic.id === 'my-words'
              ? undefined
              : () => {
                  // Nothing is lost: the topic's words and phrases move to «Мои слова» (marked as edited so seed updates keep them there).
                  words.forEach((w) => useWordsStore.getState().update({ ...w, category: 'my-words', edited: true }));
                  phrases.forEach((p) => usePhrasesStore.getState().update({ ...p, category: 'my-words', edited: true }));
                  const existing = topicDocs.find((d) => d.id === topic.id);
                  const store = useTopicsStore.getState();
                  if (existing?.custom) store.remove(topic.id);
                  else if (existing) store.update({ ...existing, hidden: true });
                  else store.add({ id: topic.id, hidden: true });
                  router.push('/topics');
                }
          }
        />
      )}
      <p className="mb-4 text-xs text-gray-500">{topicCountsLine(content)}</p>

      <div role="tablist" className="mb-4 flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={cn('rounded-full px-3 py-1 text-sm', tab === t.id ? 'bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-pink-500/20 hover:brightness-110 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10')}
            onClick={() => setSelected(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.length === 0 && (
        <p className="card p-4 text-sm text-gray-500">В этой теме пока пусто. Добавьте слова кнопкой «+» внизу справа и выберите эту тему.</p>
      )}
      {tab === 'words' && <VocabCardList items={words} onEdit={setEditing} />}
      {tab === 'phrases' && <VocabCardList items={phrases} onEdit={setEditing} />}
      {tab === 'rule' && grammar.map((g) => <GrammarTopicCard key={g.id} topic={g} showExercises={false} />)}
      {tab === 'exercises' &&
        grammar.flatMap((g) =>
          g.practiceExercises.map((ex) => (
            <div key={ex.id} className="mb-6 rounded-xl border p-4">
              <ExerciseRunner exercise={ex} />
            </div>
          ))
        )}

      {editing && (
        <EditVocabDialog
          item={editing}
          onSave={(item) => {
            updateItem(item);
            setEditing(null);
          }}
          onDelete={(id) => {
            removeItem(id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {practiceItems.length > 0 && (
        <section className="mt-8 border-t pt-4">
          <h2 className="mb-3 text-lg font-semibold">Тренировать</h2>
          <TopicPractice items={practiceItems} onUpdateItem={updateItem} />
        </section>
      )}
    </div>
  );
}
