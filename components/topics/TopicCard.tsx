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
      className="card flex flex-col gap-1 p-4 transition hover:-translate-y-0.5 hover:border-pink-400 hover:shadow-lg hover:shadow-violet-500/15"
    >
      <span className="text-2xl" aria-hidden>{topic.emoji}</span>
      <span className="font-semibold leading-tight">{topic.title}</span>
      <span className="text-xs text-gray-500">{topicCountsLine(content) || 'Правило'}</span>
      {items.length > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-violet-100 dark:bg-violet-500/15" aria-label={`Прогресс ${progress}%`}>
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </Link>
  );
}
