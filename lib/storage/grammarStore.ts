import { GrammarTopic } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useGrammarStore = createCollectionStore<GrammarTopic>('grammarTopics', localStorageAdapter);
