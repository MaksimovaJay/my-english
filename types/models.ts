export type ReviewStatus = 'new' | 'learning' | 'review' | 'known';

export interface ReviewState {
  status: ReviewStatus;
  level: number; // 0-5
  lastReviewed: string | null; // ISO date
  nextReviewDate: string | null; // ISO date
  correctCount: number;
  mistakeCount: number;
}

export interface VocabItem {
  id: string;
  english: string;
  translation: string;
  ipa?: string;
  ruPronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  category: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  notes?: string;
  dateAdded: string; // ISO date
  review: ReviewState;
}

export type Word = VocabItem;
export type Phrase = VocabItem;

export interface FillBlankItem {
  text: string; // "___" marks each blank
  blanks: string[][]; // accepted answers per blank, in text order
}

export interface MultipleChoiceItem {
  question: string;
  options: string[];
  correctIndex: number;
}

export type ExerciseType =
  | 'fill-blank'
  | 'multiple-choice'
  | 'translation'
  | 'word-order'
  | 'matching'
  | 'true-false'
  | 'listening'
  | 'writing'
  | 'reading'
  | 'image';

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  items: FillBlankItem[] | MultipleChoiceItem[];
  explanation?: string;
  relatedGrammarTopicId?: string;
}

export interface Topic {
  id: string;
  title: string;
  emoji: string;
  group: 'class' | 'extra'; // 'class' = пройдено на уроках, 'extra' = новое / не изученное
  order: number;
}

export interface GrammarTopic {
  id: string;
  topicId?: string;
  title: string;
  explanation: string;
  examples: string[];
  practiceExercises: Exercise[];
  dateAdded: string;
}

export type HomeworkStatus = 'not-started' | 'in-progress' | 'completed';

export interface ExerciseProgress {
  userAnswers: (string[] | number | null)[]; // index-aligned with exercise.items
  checked: boolean[];
  correct: boolean[];
}

export interface Homework {
  id: string;
  title: string;
  assignedDate: string;
  dueDate?: string;
  status: HomeworkStatus;
  exercises: Exercise[];
  progress: Record<string, ExerciseProgress>; // key = exercise.id
  score?: { correct: number; total: number };
  sourceNote?: string;
}
