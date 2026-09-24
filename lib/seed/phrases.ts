import { Phrase } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

function p(partial: Omit<Phrase, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Phrase {
  return {
    id: `seed-phrase-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-24',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-24T00:00:00Z')),
    ...partial,
  };
}

export const seedPhrases: Phrase[] = [
  p({ english: 'How are you?', translation: 'Как дела?', ipa: 'haʊ ɑːr juː', ruPronunciation: 'хау ар ю', category: 'Phrases' }),
  p({ english: 'Nice to meet you.', translation: 'Приятно познакомиться.', ipa: 'naɪs tuː miːt juː', ruPronunciation: 'найс ту мит ю', category: 'Phrases' }),
  p({ english: 'What time is it?', translation: 'Который час?', ipa: 'wɒt taɪm ɪz ɪt', ruPronunciation: 'вот тайм из ит', category: 'Phrases' }),
  p({ english: 'I have no idea.', translation: 'Понятия не имею.', ipa: 'aɪ hæv noʊ aɪˈdiːə', ruPronunciation: 'ай хэв ноу айдиа', category: 'Phrases' }),
];
