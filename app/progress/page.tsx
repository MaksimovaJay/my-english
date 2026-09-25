'use client';

import { useRef, useState } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { computeProgressStats } from '@/lib/learning/progressStats';
import { exportAllData, importAllData, importVocabCsv } from '@/lib/storage/exportImport';

// jsdom's File/Blob implementation does not provide `.text()` (or `.arrayBuffer()`/`.stream()`),
// so file content is read via FileReader, which is supported both in the browser and in tests.
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

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

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mjay-english-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importAllData(await readFileAsText(file));
    setImportMessage('Data imported.');
    e.target.value = '';
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const count = importVocabCsv(await readFileAsText(file));
    setImportMessage(`Imported ${count} word(s) from CSV.`);
    e.target.value = '';
  }

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

      <div className="mt-8 border-t pt-4">
        <h2 className="mb-2 text-sm font-semibold">Your data</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded border px-3 py-1" onClick={handleExport}>Export JSON</button>
          <button className="rounded border px-3 py-1" onClick={() => jsonInputRef.current?.click()}>Import JSON</button>
          <button className="rounded border px-3 py-1" onClick={() => csvInputRef.current?.click()}>Import Vocabulary CSV</button>
          <input ref={jsonInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCsv} />
        </div>
        {importMessage && <p className="mt-2 text-xs text-green-600">{importMessage}</p>}
      </div>
    </div>
  );
}
