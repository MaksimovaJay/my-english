'use client';

import Link from 'next/link';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { getDueItems } from '@/lib/learning/reviewQueue';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const homeworks = useHomeworkStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);

  const dueCount = getDueItems([...words, ...phrases]).length;
  const inProgressHomework = homeworks.find((h) => h.status === 'in-progress');

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-2 text-2xl font-bold">{greeting()}, MJay 👋</h1>
      <div className="mb-6 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
        <p>📚 {dueCount} words to review</p>
        <p>🔥 {streak} day streak</p>
      </div>
      <Link href="/review" className="inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-bold text-white">
        START LEARNING
      </Link>
      {inProgressHomework && (
        <div className="mt-6">
          <p className="mb-1 text-sm text-gray-500">Continue learning</p>
          <Link href={`/homework/${inProgressHomework.id}`} className="text-blue-600 underline">
            {inProgressHomework.title}
          </Link>
        </div>
      )}
    </div>
  );
}
