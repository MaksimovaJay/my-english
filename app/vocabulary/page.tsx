// app/vocabulary/page.tsx
'use client';
import { VocabSection } from '@/components/vocabulary/VocabSection';
import { useWordsStore } from '@/lib/storage/wordsStore';

export default function VocabularyPage() {
  return <VocabSection store={useWordsStore} title="📚 My Vocabulary" kind="word" />;
}
