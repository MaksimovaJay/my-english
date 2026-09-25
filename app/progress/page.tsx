'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { computeProgressStats } from '@/lib/learning/progressStats';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);
  const stats = computeProgressStats([...words, ...phrases]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">📊 Progress</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total words" value={stats.total} />
        <StatCard label="Learned" value={stats.learned} />
        <StatCard label="Learning" value={stats.learning} />
        <StatCard label="Needs review" value={stats.needsReview} />
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <p>Accuracy: <strong>{stats.accuracy}%</strong></p>
        <p>Streak: <strong>🔥 {streak} days</strong></p>
      </div>
    </div>
  );
}
