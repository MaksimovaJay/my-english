import { HomeworkReview } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useHomeworkReviewsStore = createCollectionStore<HomeworkReview>('homework-reviews', localStorageAdapter);
