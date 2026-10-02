export type ReviewStatus = 'new' | 'learning' | 'review' | 'known';

export interface ReviewState {
  status: ReviewStatus;
  level: number; // 0-5
  lastReviewed: string | null; // ISO date
  nextReviewDate: string | null; // ISO date
  correctCount: number;
  mistakeCount: number;
  forgetting?: boolean; // «Знаю, но забываю»: shown more often until a clean «Знаю»
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
  edited?: boolean; // changed by hand: seed updates no longer overwrite its text
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

export interface SentenceOrderItem {
  sentence: string; // the correct sentence; its words are shown shuffled
  translation?: string;
}

export interface WordListItem {
  wordId: string; // the word in the base (words collection)
  english: string;
  translation: string;
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
  | 'free-text'
  | 'sentence-order'
  | 'word-list'
  | 'word-bank';

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  items: FillBlankItem[] | MultipleChoiceItem[] | FreeTextItem[] | SentenceOrderItem[] | WordListItem[];
  explanation?: string;
  relatedGrammarTopicId?: string;
  /** word-bank: the list of words to pick from (items are FillBlankItem). */
  bank?: string[];
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
  completedDate?: string; // YYYY-MM-DD of «Сдать домашку» (counts for the daily plan)
}

/** Game / practice modes, as offered in «Тренировать» and «Игры». */
export type GameId = 'flashcards' | 'typing' | 'listening' | 'speak' | 'sentence' | 'wordbank' | 'letters' | 'matching' | 'floating' | 'timed';

/** «Урок»: prepared by the teacher; on completion its material moves into a topic. */
export interface Lesson {
  id: string;
  number: number; // Урок N
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  images?: string[];
  words: { english: string; translation: string; example?: string; exampleTranslation?: string }[]; // kept inside the lesson until completion
  conditions?: string; // «Условия»: what we do and in what order
  rules?: string; // «Правила»: grammar explanation
  games: GameId[]; // games ticked for the lesson
  practice: Homework; // exercises + progress, same engine and UI as homework
  status: 'planned' | 'completed';
  topicId?: string; // the topic created on completion
  /** Everything completion added to the base, so deleting the lesson can remove it again. */
  created?: { wordIds: string[]; phraseIds: string[]; grammarId?: string };
}
