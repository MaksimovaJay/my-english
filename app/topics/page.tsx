'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TopicCard } from '@/components/topics/TopicCard';
import { useTopicContents, useTopics } from '@/components/topics/useTopicContents';
import { TopicDialog } from '@/components/topics/TopicDialog';
import { newTopicDoc } from '@/lib/learning/topicEdits';
import { useTopicsStore } from '@/lib/storage/topicsStore';

const GROUPS = [
  { group: 'class', title: 'Пройдено на уроках' },
  { group: 'extra', title: 'Новое / не изученное' },
] as const;

export default function TopicsPage() {
  const contents = useTopicContents();
  const topics = useTopics();
  const addTopic = useTopicsStore((s) => s.add);
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">📚 Темы</h1>
        <button type="button" className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:border-pink-400" onClick={() => setCreating(true)}>
          <Plus size={16} /> Новая тема
        </button>
      </div>
      {creating && (
        <TopicDialog
          heading="Новая тема"
          onClose={() => setCreating(false)}
          onSave={(values) => {
            const doc = newTopicDoc(values, topics);
            addTopic(doc);
            setCreating(false);
            router.push(`/topics/${doc.id}`);
          }}
        />
      )}
      {GROUPS.map(({ group, title }) => {
        const list = contents.filter((c) => c.topic.group === group);
        if (list.length === 0) return null;
        return (
          <section key={group} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((c) => <TopicCard key={c.topic.id} content={c} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
