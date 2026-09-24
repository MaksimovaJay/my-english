import { Word } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useWordsStore = createCollectionStore<Word>('words', localStorageAdapter);
