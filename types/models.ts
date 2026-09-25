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

export interface FreeTextItem {
  prompt: string; // optional extra hint; the exercise instruction names the book number
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
  | 'image'
  | 'free-text';

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  items: FillBlankItem[] | MultipleChoiceItem[] | FreeTextItem[];
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
  number?: number; // ДЗ N

  title: string;
  assignedDate: string;
  dueDate?: string;
  status: HomeworkStatus;
  exercises: Exercise[];
  progress: Record<string, ExerciseProgress>; // key = exercise.id
  score?: { correct: number; total: number };
  sourceNote?: string;
  teacherNotes?: string;
  images?: string[]; // compressed JPEG data URLs of book pages / screenshots
}
