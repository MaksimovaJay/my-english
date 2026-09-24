'use client';

import { useGrammarStore } from '@/lib/storage/grammarStore';
import { GrammarTopicCard } from '@/components/grammar/GrammarTopicCard';

export default function GrammarPage() {
  const topics = useGrammarStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">📖 Grammar</h1>
      {topics.length === 0 && <p className="text-sm text-gray-500">No grammar topics yet — add one from + Add New.</p>}
      {topics.map((t) => <GrammarTopicCard key={t.id} topic={t} />)}
    </div>
  );
}
