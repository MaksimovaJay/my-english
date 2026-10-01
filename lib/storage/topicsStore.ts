import { TopicDoc } from '@/lib/learning/topicEdits';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

/** User changes to topics (renames, deletions, new topics); synced like every other collection. */
export const useTopicsStore = createCollectionStore<TopicDoc>('topics', localStorageAdapter);
