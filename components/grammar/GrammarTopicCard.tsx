import { GrammarTopic } from '@/types/models';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';

interface GrammarTopicCardProps {
  topic: GrammarTopic;
  showExercises?: boolean;
}

export function GrammarTopicCard({ topic, showExercises = true }: GrammarTopicCardProps) {
  return (
    <div className="mb-4 rounded-xl border p-4">
      <h2 className="text-lg font-bold">{topic.title}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{topic.explanation}</p>
      {topic.examples.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm">
          {topic.examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      )}
      {showExercises && topic.practiceExercises.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="mb-2 text-sm font-semibold">Практика</h3>
          {topic.practiceExercises.map((ex) => <ExerciseRunner key={ex.id} exercise={ex} />)}
        </div>
      )}
    </div>
  );
}
