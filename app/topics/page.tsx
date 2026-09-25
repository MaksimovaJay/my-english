'use client';

import { TopicCard } from '@/components/topics/TopicCard';
import { useTopicContents } from '@/components/topics/useTopicContents';

const GROUPS = [
  { group: 'class', title: 'Пройдено на уроках' },
  { group: 'extra', title: 'Новое / не изученное' },
] as const;

export default function TopicsPage() {
  const contents = useTopicContents();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">📚 Темы</h1>
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
