import { Lesson } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useLessonsStore = createCollectionStore<Lesson>('lessons', localStorageAdapter);
