'use client';

import { useParams } from 'next/navigation';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';

export default function ExerciseAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const exercise = useExercisesStore((s) => s.items.find((e) => e.id === id));

  if (!exercise) return <p className="text-sm text-gray-500">Exercise not found.</p>;

  return (
    <div className="mx-auto max-w-xl">
      <ExerciseRunner exercise={exercise} />
    </div>
  );
}
