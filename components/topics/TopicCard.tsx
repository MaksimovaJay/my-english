import Link from 'next/link';
import { TopicContent, topicProgress } from '@/lib/learning/topics';
import { pluralRu } from '@/lib/utils';

export function topicCountsLine({ words, phrases, exerciseCount }: TopicContent): string {
  return [
    words.length > 0 && `${words.length} ${pluralRu(words.length, ['слово', 'слова', 'слов'])}`,
    phrases.length > 0 && `${phrases.length} ${pluralRu(phrases.length, ['фраза', 'фразы', 'фраз'])}`,
    exerciseCount > 0 && `${exerciseCount} упр.`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function TopicCard({ content }: { content: TopicContent }) {
  const { topic, words, phrases } = content;
  const items = [...words, ...phrases];
  const progress = topicProgress(items);

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="flex flex-col gap-1 rounded-xl border p-4 transition hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
    >
      <span className="text-2xl" aria-hidden>{topic.emoji}</span>
      <span className="font-semibold leading-tight">{topic.title}</span>
      <span className="text-xs text-gray-500">{topicCountsLine(content) || 'Правило'}</span>
      {items.length > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800" aria-label={`Прогресс ${progress}%`}>
          <div className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </Link>
  );
}
