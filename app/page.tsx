'use client';

import Link from 'next/link';
import { newThisWeek } from '@/lib/learning/topics';
import { useTopicContents } from '@/components/topics/useTopicContents';
import { DailyPlan } from '@/components/home/DailyPlan';
import { WordOfDay } from '@/components/home/WordOfDay';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function HomePage() {
  const fresh = newThisWeek(useTopicContents());

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 text-center">
      <h1 className="text-3xl font-extrabold">{greeting()}, <span className="text-gradient">MJay</span> 👋</h1>
      <DailyPlan />
      <WordOfDay />

      {fresh.length > 0 && (
        <section className="text-left">
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
