import { Homework } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useHomeworkStore = createCollectionStore<Homework>('homeworks', localStorageAdapter);
