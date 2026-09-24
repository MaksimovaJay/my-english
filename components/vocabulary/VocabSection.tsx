// components/vocabulary/VocabSection.tsx
'use client';

import { useState } from 'react';
import { UseBoundStore, StoreApi } from 'zustand';
import { VocabItem } from '@/types/models';
import { CollectionState } from '@/lib/storage/createCollectionStore';
import { VocabTable } from './VocabTable';
import { VocabForm } from './VocabForm';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { TypingPractice } from '@/components/exercises/TypingPractice';
import { ListeningPractice } from '@/components/exercises/ListeningPractice';
import { cn } from '@/lib/utils';

type Mode = 'table' | 'flashcards' | 'typing' | 'listening';

interface VocabSectionProps {
  store: UseBoundStore<StoreApi<CollectionState<VocabItem>>>;
  title: string;
  kind: 'word' | 'phrase';
}

export function VocabSection({ store, title }: VocabSectionProps) {
  const items = store((s) => s.items);
  const add = store((s) => s.add);
  const update = store((s) => s.update);
  const remove = store((s) => s.remove);

  const [mode, setMode] = useState<Mode>('table');
  const [editing, setEditing] = useState<VocabItem | 'new' | null>(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{title}</h1>
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => setEditing('new')}>+ Add</button>
      </div>

      <div className="mb-4 flex gap-2">
        {(['table', 'flashcards', 'typing', 'listening'] as Mode[]).map((m) => (
          <button
            key={m}
            className={cn('rounded-full border px-3 py-1 text-sm capitalize', mode === m && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {editing && (
        <div className="mb-4 rounded-lg border p-4">
          <VocabForm
            initial={editing === 'new' ? undefined : editing}
            onSubmit={(item) => {
              if (editing === 'new') add(item);
              else update(item);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {mode === 'table' && <VocabTable items={items} onEdit={setEditing} onDelete={remove} />}
      {mode === 'flashcards' && <FlashcardDeck items={items} onUpdateItem={update} />}
      {mode === 'typing' && <TypingPractice items={items} />}
      {mode === 'listening' && <ListeningPractice items={items} />}
    </div>
  );
}
