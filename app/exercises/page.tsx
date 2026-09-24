'use client';

import Link from 'next/link';
import { useExercisesStore } from '@/lib/storage/exercisesStore';

export default function ExercisesPage() {
  const exercises = useExercisesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">✏️ Exercises</h1>
      {exercises.length === 0 && <p className="text-sm text-gray-500">No exercises yet — add one from + Add New.</p>}
      <ul className="flex flex-col gap-2">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link href={`/exercises/${ex.id}`} className="block rounded-lg border p-3 hover:bg-black/5 dark:hover:bg-white/10">
              {ex.instruction}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
