// components/vocabulary/VocabForm.tsx
'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { generateId } from '@/lib/utils';
import { createInitialReviewState } from '@/lib/learning/review';
import { ListenButton } from '@/components/shared/ListenButton';

interface VocabFormProps {
  initial?: VocabItem;
  onSubmit: (item: VocabItem) => void;
  onCancel?: () => void;
}

const CATEGORIES = ['Home', 'Food', 'Family', 'People', 'Travel', 'Directions', 'Work', 'Daily Life', 'Grammar', 'Phrases', 'Other'];

export function VocabForm({ initial, onSubmit, onCancel }: VocabFormProps) {
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');
  const [ipa, setIpa] = useState(initial?.ipa ?? '');
  const [ruPronunciation, setRuPronunciation] = useState(initial?.ruPronunciation ?? '');
  const [example, setExample] = useState(initial?.example ?? '');
  const [exampleTranslation, setExampleTranslation] = useState(initial?.exampleTranslation ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim() || !translation.trim() || !category.trim()) {
      setError('English, translation and category are required.');
      return;
    }
    setError(null);
    onSubmit({
      id: initial?.id ?? generateId(),
      english: english.trim(),
      translation: translation.trim(),
      ipa: ipa.trim() || undefined,
      ruPronunciation: ruPronunciation.trim() || undefined,
      example: example.trim() || undefined,
      exampleTranslation: exampleTranslation.trim() || undefined,
      category: category.trim(),
      tags: initial?.tags ?? [],
      dateAdded: initial?.dateAdded ?? new Date().toISOString().slice(0, 10),
      review: initial?.review ?? createInitialReviewState(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        English
        <span className="flex items-center gap-2">
          <input className="flex-1 rounded border px-2 py-1" value={english} onChange={(e) => setEnglish(e.target.value)} />
          {english && <ListenButton text={english} />}
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Translation
        <input className="rounded border px-2 py-1" value={translation} onChange={(e) => setTranslation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        IPA pronunciation
        <input className="rounded border px-2 py-1" value={ipa} onChange={(e) => setIpa(e.target.value)} placeholder="/ˈmʌðər/" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Russian pronunciation
        <input className="rounded border px-2 py-1" value={ruPronunciation} onChange={(e) => setRuPronunciation(e.target.value)} placeholder="мадэр / мазэр" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Example
        <input className="rounded border px-2 py-1" value={example} onChange={(e) => setExample(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Example meaning
        <input className="rounded border px-2 py-1" value={exampleTranslation} onChange={(e) => setExampleTranslation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <input className="rounded border px-2 py-1" list="vocab-categories" value={category} onChange={(e) => setCategory(e.target.value)} />
        <datalist id="vocab-categories">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded border px-4 py-2 text-sm">Cancel</button>}
      </div>
    </form>
  );
}
