'use client';

import Link from 'next/link';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { getDueItems } from '@/lib/learning/reviewQueue';
import { newThisWeek } from '@/lib/learning/topics';
import { useTopicContents } from '@/components/topics/useTopicContents';
import { pluralRu } from '@/lib/utils';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function HomePage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const homeworks = useHomeworkStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);
  const fresh = newThisWeek(useTopicContents());

  const dueCount = getDueItems([...words, ...phrases]).length;
  const inProgressHomework = homeworks.find((h) => h.status === 'in-progress');

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-2 text-2xl font-bold">{greeting()}, MJay 👋</h1>
      <div className="mb-6 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
        <p>📚 {dueCount} {pluralRu(dueCount, ['слово', 'слова', 'слов'])} на повторение</p>
        <p>🔥 {streak} {pluralRu(streak, ['день', 'дня', 'дней'])} подряд</p>
      </div>
      <Link href="/review" className="inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-bold text-white">
        НАЧАТЬ ПОВТОРЕНИЕ
      </Link>

      {inProgressHomework && (
        <p className="mt-6 text-sm">
          <Link href={`/homework/${inProgressHomework.id}`} className="text-blue-600 underline">
            📝 Продолжить домашку: {inProgressHomework.title}
          </Link>
        </p>
      )}

      {fresh.length > 0 && (
        <section className="mt-8 text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Новое на этой неделе</h2>
          <ul className="flex flex-col gap-2">
            {fresh.map(({ topic, count }) => (
              <li key={topic.id}>
                <Link href={`/topics/${topic.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <span>{topic.emoji} {topic.title}</span>
                  <span className="text-xs text-gray-500">+{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
