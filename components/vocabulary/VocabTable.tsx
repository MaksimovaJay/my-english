// components/vocabulary/VocabTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { Shuffle, Eye, EyeOff, Lock, Pencil, Trash2 } from 'lucide-react';
import { VocabItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface VocabTableProps {
  items: VocabItem[];
  onEdit: (item: VocabItem) => void;
  onDelete: (id: string) => void;
}

type Column = 'english' | 'translation' | 'pronunciation' | 'example';
const COLUMNS: { key: Column; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'translation', label: 'Translation' },
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'example', label: 'Example' },
];

export function VocabTable({ items, onEdit, onDelete }: VocabTableProps) {
  const [visible, setVisible] = useState<Record<Column, boolean>>({ english: true, translation: true, pronunciation: true, example: true });
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[] | null>(null);
  const [search, setSearch] = useState('');

  function toggleColumn(col: Column) {
    setVisible((v) => ({ ...v, [col]: !v[col] }));
  }

  function hideAll() {
    setVisible({ english: false, translation: false, pronunciation: false, example: false });
    setRevealed(new Set());
  }

  function shuffle() {
    const ids = items.map((i) => i.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder(ids);
  }

  function reveal(cellKey: string) {
    setRevealed((prev) => new Set(prev).add(cellKey));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? items.filter((i) => i.english.toLowerCase().includes(q) || i.translation.toLowerCase().includes(q))
      : items;
    if (!order) return base;
    const byId = new Map(base.map((i) => [i.id, i]));
    return order.map((id) => byId.get(id)).filter((i): i is VocabItem => Boolean(i));
  }, [items, search, order]);

  function cellValue(item: VocabItem, col: Column): string {
    if (col === 'english') return item.english;
    if (col === 'translation') return item.translation;
    if (col === 'pronunciation') return item.ipa ?? item.ruPronunciation ?? '—';
    return item.example ?? '—';
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            className={cn('flex items-center gap-1 rounded-full border px-2 py-1 text-xs', visible[col.key] ? 'bg-gray-100 dark:bg-gray-800' : 'opacity-50')}
            onClick={() => toggleColumn(col.key)}
          >
            {visible[col.key] ? <Eye size={14} /> : <EyeOff size={14} />} {col.label}
          </button>
        ))}
        <button className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs" onClick={shuffle}>
          <Shuffle size={14} /> Random
        </button>
        <button className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs" onClick={hideAll}>
          <Lock size={14} /> Hide All
        </button>
        <input
          className="ml-auto rounded border px-2 py-1 text-xs"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b">
              {COLUMNS.map((c) => <th key={c.key} className="px-2 py-1 font-medium">{c.label}</th>)}
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                {COLUMNS.map((c) => {
                  const cellKey = `${item.id}-${c.key}`;
                  const isRevealed = revealed.has(cellKey);
                  return (
                    <td key={c.key} className="px-2 py-1">
                      <button type="button" className="text-left" onClick={() => reveal(cellKey)}>
                        {isRevealed || visible[c.key] ? cellValue(item, c.key) : '???'}
                      </button>
                    </td>
                  );
                })}
                <td className="flex gap-1 px-2 py-1">
                  <button aria-label="Edit" onClick={() => onEdit(item)}><Pencil size={14} /></button>
                  <button aria-label="Delete" onClick={() => onDelete(item.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
