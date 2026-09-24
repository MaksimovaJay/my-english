'use client';

import { useState } from 'react';
import { VocabForm } from '@/components/vocabulary/VocabForm';
import { GrammarTopicForm } from '@/components/grammar/GrammarTopicForm';
import { ExerciseForm } from '@/components/exercises/ExerciseForm';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { cn } from '@/lib/utils';

type MaterialType = 'Word' | 'Phrase' | 'Grammar' | 'Exercise' | 'Note';

const TYPES: MaterialType[] = ['Word', 'Phrase', 'Grammar', 'Exercise', 'Note'];

export default function AddPage() {
  const [type, setType] = useState<MaterialType>('Word');
  const addWord = useWordsStore((s) => s.add);
  const addPhrase = usePhrasesStore((s) => s.add);
  const addGrammarTopic = useGrammarStore((s) => s.add);
  const addExercise = useExercisesStore((s) => s.add);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">+ Add New</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            className={cn('rounded-full border px-3 py-1 text-sm', type === t && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {(type === 'Word' || type === 'Phrase') && (
        <VocabForm
          key={type}
          onSubmit={(item) => {
            if (type === 'Word') addWord(item);
            else addPhrase(item);
            setSavedMessage(`${type} saved.`);
          }}
        />
      )}
      {type === 'Grammar' && (
        <GrammarTopicForm
          onSubmit={(topic) => {
            addGrammarTopic(topic);
            setSavedMessage('Grammar topic saved.');
          }}
        />
      )}
      {type === 'Exercise' && (
        <ExerciseForm
          onSubmit={(exercise) => {
            addExercise(exercise);
            setSavedMessage('Exercise saved.');
          }}
        />
      )}
      {type === 'Note' && <p className="text-sm text-gray-500">Free-form notes are not part of Phase 1.</p>}

      {savedMessage && <p className="mt-3 text-sm text-green-600">{savedMessage}</p>}
    </div>
  );
}
