// app/phrases/page.tsx
'use client';
import { VocabSection } from '@/components/vocabulary/VocabSection';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';

export default function PhrasesPage() {
  return <VocabSection store={usePhrasesStore} title="💬 My Phrases" kind="phrase" />;
}
