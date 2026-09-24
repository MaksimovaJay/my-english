import { Exercise } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useExercisesStore = createCollectionStore<Exercise>('exercises', localStorageAdapter);
