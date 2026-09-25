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
import { homeworkLabel } from '@/lib/learning/homework';

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
  const openHomework =
    homeworks.find((h) => h.status === 'in-progress') ?? homeworks.find((h) => h.status === 'not-started');

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-2 text-3xl font-extrabold">{greeting()}, <span className="text-gradient">MJay</span> 👋</h1>
      <div className="mb-6 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
        <p>📚 {dueCount} {pluralRu(dueCount, ['слово', 'слова', 'слов'])} на повторение</p>
        <p>🔥 {streak} {pluralRu(streak, ['день', 'дня', 'дней'])} подряд</p>
      </div>
      <Link href="/review" className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3 text-lg font-extrabold tracking-wide text-white shadow-lg shadow-pink-500/30 transition hover:scale-[1.02] hover:brightness-110">
        НАЧАТЬ ПОВТОРЕНИЕ
      </Link>

      {openHomework && (
        <p className="mt-6 text-sm">
          <Link href={`/homework/${openHomework.id}`} className="text-violet-600 underline">
            📝 {openHomework.status === 'in-progress' ? 'Продолжить' : 'Домашка'}: {homeworkLabel(openHomework)}
          </Link>
        </p>
      )}

      {fresh.length > 0 && (
        <section className="mt-8 text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Новое на этой неделе</h2>
          <ul className="flex flex-col gap-2">
            {fresh.slice(0, 5).map(({ topic, count }) => (
              <li key={topic.id}>
                <Link href={`/topics/${topic.id}`} className="card flex items-center justify-between p-3 transition hover:border-pink-400">
                  <span>{topic.emoji} {topic.title}</span>
                  <span className="text-xs text-gray-500">+{count}</span>
                </Link>
              </li>
            ))}
          </ul>
          {fresh.length > 5 && (
            <Link href="/topics" className="mt-2 inline-block text-sm text-violet-600 underline">
              Ещё {fresh.length - 5} — все темы →
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
