'use client';

import { useState } from 'react';
import { GrammarTopic } from '@/types/models';
import { generateId } from '@/lib/utils';

interface GrammarTopicFormProps {
  onSubmit: (topic: GrammarTopic) => void;
}

export function GrammarTopicForm({ onSubmit }: GrammarTopicFormProps) {
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [examplesText, setExamplesText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !explanation.trim()) {
      setError('Title and explanation are required.');
      return;
    }
    setError(null);
    onSubmit({
      id: generateId(),
      title: title.trim(),
      explanation: explanation.trim(),
      examples: examplesText.split('\n').map((l) => l.trim()).filter(Boolean),
      practiceExercises: [],
      dateAdded: new Date().toISOString().slice(0, 10),
    });
    setTitle('');
    setExplanation('');
    setExamplesText('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Topic
        <input className="rounded border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Explanation
        <textarea className="rounded border px-2 py-1" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Examples (one per line)
        <textarea className="rounded border px-2 py-1" value={examplesText} onChange={(e) => setExamplesText(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
    </form>
  );
}
