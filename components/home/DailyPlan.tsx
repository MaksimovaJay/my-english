'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { usePlan } from './usePlan';
import { isPlanDone } from '@/lib/learning/plan';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { pluralRu, cn } from '@/lib/utils';

export function DailyPlan() {
  const { tasks } = usePlan();
  const streak = useSettingsStore((s) => s.streak);
  const done = isPlanDone(tasks);
  const next = tasks.find((t) => !t.done);

  return (
    <section className="card p-4 text-left">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">📋 План на сегодня</h2>
        <span className="text-sm text-gray-500">🔥 {streak} {pluralRu(streak, ['день', 'дня', 'дней'])}</span>
      </div>
      <ul className="mb-4 flex flex-col gap-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Link href={t.href} className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-violet-50 dark:hover:bg-violet-500/10">
              {t.done ? <CheckCircle2 className="shrink-0 text-green-500" size={20} /> : <Circle className="shrink-0 text-gray-400" size={20} />}
              <span className={cn('flex-1 text-sm', t.done && 'text-gray-500 line-through')}>{t.label}</span>
              <span className="text-xs text-gray-500">{t.progress}</span>
            </Link>
          </li>
        ))}
      </ul>
      {done ? (
        <p className="text-center font-semibold">🎉 План выполнен! Увидимся завтра</p>
      ) : (
        next && (
          <Link
            href={next.href}
            className="block rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 text-center text-lg font-extrabold tracking-wide text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110"
          >
            НАЧАТЬ
          </Link>
        )
      )}
    </section>
  );
}
