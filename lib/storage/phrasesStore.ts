import { Phrase } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const usePhrasesStore = createCollectionStore<Phrase>('phrases', localStorageAdapter);
