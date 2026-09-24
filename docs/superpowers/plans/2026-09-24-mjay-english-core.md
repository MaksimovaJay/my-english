# MJay English — Core App (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working, locally-run personal English learning app (vocabulary, phrases, grammar, exercises, homework, games, review, progress) with no backend and no external services.

**Architecture:** Next.js App Router + TypeScript + Tailwind + shadcn/ui. All domain logic lives in pure, unit-tested functions under `lib/`. All persistent data goes through a single `StorageAdapter` interface (`lib/storage/types.ts`) backed by `localStorage`, wrapped by small Zustand stores per collection. UI components are thin and call store actions / pure lib functions.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix-based), lucide-react, zustand, Vitest + @testing-library/react for tests.

## Global Constraints

- No backend, no external APIs, no hosting/deploy — app runs only via `npm run dev`. Ref: design spec §1, §2.
- Persistence: `localStorage` only, accessed exclusively through `lib/storage` adapter, key prefix `mjay-english:`. Ref: design spec §3.
- Spaced-repetition intervals (days) by level 0-5: `[0, 1, 3, 7, 14, 30]`. Ref: design spec §6.
- Homework/exercise answer checking is plain string normalization + matching (trim, lowercase, collapse whitespace) — no AI/NLU grading anywhere in this codebase. Ref: design spec §4, §9.
- Pronunciation via Web Speech API (`speechSynthesis`) only — no external TTS. Ref: design spec §7.
- Git remote is already `git@github.com:MaksimovaJay/my-english.git` — never push without explicit user confirmation in chat.
- Seed data (small demo set) loads only when a collection is empty on first run. Ref: design spec §3.
- Exercise/Add-New authoring UI supports exactly two types in Phase 1: `fill-blank` and `multiple-choice`. Other `ExerciseType` values exist in the type system for future use but have no authoring UI yet.
- Any test that renders a component or page using `next/navigation` hooks (`usePathname`, `useParams`, `useRouter`) must `vi.mock('next/navigation', () => ({ ... }))` at the top of that test file — these hooks throw outside a real Next.js router and RTL's plain `render()` does not provide one.

---

## Phase A — Foundation (types, storage, core logic)

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`, `lib/utils.ts`
- Test: `lib/utils.test.ts`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `lib/utils.ts`, used by every styled component from Task 11 onward.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mjay-english",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0",
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "@testing-library/react": "^15.0.7",
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `.gitignore`**

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
```

```js
// postcss.config.mjs
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```
# .gitignore
node_modules
.next
out
*.local
.env*.local
```

- [ ] **Step 4: Create minimal `app/layout.tsx` and `app/page.tsx`**

```tsx
// app/layout.tsx
import './globals.css';

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function HomePage() {
  return <main className="p-6">MJay English — coming soon</main>;
}
```

- [ ] **Step 5: Create `lib/utils.ts` (cn helper)**

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
```

- [ ] **Step 6: Write the failing test for `cn`**

```ts
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, generateId } from './utils';

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('lets tailwind-merge resolve conflicting utility classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

describe('generateId', () => {
  it('returns a non-empty unique string', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 7: Create `vitest.config.ts` and `vitest.setup.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 8: Install dependencies and run the test**

Run: `npm install`
Run: `npm run test`
Expected: PASS (3 tests in `lib/utils.test.ts`)

- [ ] **Step 9: Verify the Next.js build compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest project"
```

---

### Task 2: Core types and date helpers

**Files:**
- Create: `types/models.ts`, `lib/learning/date.ts`
- Test: `lib/learning/date.test.ts`

**Interfaces:**
- Produces: types `ReviewState`, `ReviewStatus`, `VocabItem`, `Word`, `Phrase`, `FillBlankItem`, `MultipleChoiceItem`, `ExerciseType`, `Exercise`, `GrammarTopic`, `HomeworkStatus`, `ExerciseProgress`, `Homework` from `types/models.ts`; functions `toISODate(date: Date): string` and `addDays(date: Date, days: number): Date` from `lib/learning/date.ts`. Used by every task from here on.

- [ ] **Step 1: Write `types/models.ts`**

```ts
// types/models.ts
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

export interface GrammarTopic {
  id: string;
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
```

- [ ] **Step 2: Write the failing test for date helpers**

```ts
// lib/learning/date.test.ts
import { describe, it, expect } from 'vitest';
import { toISODate, addDays } from './date';

describe('toISODate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-09-24T15:30:00Z'))).toBe('2026-09-24');
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const result = addDays(new Date('2026-09-24T00:00:00Z'), 3);
    expect(toISODate(result)).toBe('2026-09-27');
  });

  it('supports negative days', () => {
    const result = addDays(new Date('2026-09-24T00:00:00Z'), -1);
    expect(toISODate(result)).toBe('2026-09-23');
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npm run test -- lib/learning/date.test.ts`
Expected: FAIL (`./date` has no exports / module not found)

- [ ] **Step 4: Implement `lib/learning/date.ts`**

```ts
// lib/learning/date.ts
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add types/models.ts lib/learning/date.ts lib/learning/date.test.ts
git commit -m "feat: add core domain types and date helpers"
```

---

### Task 3: Storage adapter

**Files:**
- Create: `lib/storage/types.ts`, `lib/storage/localStorageAdapter.ts`
- Test: `lib/storage/localStorageAdapter.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `StorageAdapter` interface (`list`, `get`, `set`, `remove`, `clear`) and `localStorageAdapter: StorageAdapter` singleton, used by Task 6 stores.

- [ ] **Step 1: Write the failing test**

```ts
// lib/storage/localStorageAdapter.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageAdapter } from './localStorageAdapter';

interface Item { id: string; value: string; }

describe('localStorageAdapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty list for an unknown collection', () => {
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('sets and lists items', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('words', { id: '2', value: 'b' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([
      { id: '1', value: 'a' },
      { id: '2', value: 'b' },
    ]);
  });

  it('overwrites an item with the same id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('words', { id: '1', value: 'updated' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([{ id: '1', value: 'updated' }]);
  });

  it('gets a single item by id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    expect(localStorageAdapter.get<Item>('words', '1')).toEqual({ id: '1', value: 'a' });
    expect(localStorageAdapter.get<Item>('words', 'missing')).toBeUndefined();
  });

  it('removes an item by id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.remove('words', '1');
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('clears a whole collection', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.clear('words');
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('keeps collections isolated under a namespaced key', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('phrases', { id: '1', value: 'b' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([{ id: '1', value: 'a' }]);
    expect(localStorageAdapter.list<Item>('phrases')).toEqual([{ id: '1', value: 'b' }]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/storage/localStorageAdapter.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/storage/types.ts`**

```ts
// lib/storage/types.ts
export interface StorageAdapter {
  list<T>(collection: string): T[];
  get<T>(collection: string, id: string): T | undefined;
  set<T extends { id: string }>(collection: string, item: T): void;
  remove(collection: string, id: string): void;
  clear(collection: string): void;
}
```

- [ ] **Step 4: Implement `lib/storage/localStorageAdapter.ts`**

```ts
// lib/storage/localStorageAdapter.ts
import { StorageAdapter } from './types';

const PREFIX = 'mjay-english:';

function readCollection<T>(collection: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(PREFIX + collection);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFIX + collection, JSON.stringify(items));
}

export const localStorageAdapter: StorageAdapter = {
  list<T>(collection: string): T[] {
    return readCollection<T>(collection);
  },
  get<T>(collection: string, id: string): T | undefined {
    return readCollection<T & { id: string }>(collection).find((i) => i.id === id) as T | undefined;
  },
  set<T extends { id: string }>(collection: string, item: T): void {
    const items = readCollection<T>(collection);
    const idx = items.findIndex((i: any) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    writeCollection(collection, items);
  },
  remove(collection: string, id: string): void {
    const items = readCollection<{ id: string }>(collection).filter((i) => i.id !== id);
    writeCollection(collection, items);
  },
  clear(collection: string): void {
    writeCollection(collection, []);
  },
};
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/storage/types.ts lib/storage/localStorageAdapter.ts lib/storage/localStorageAdapter.test.ts
git commit -m "feat: add localStorage-backed storage adapter"
```

---

### Task 4: Review scoring logic

**Files:**
- Create: `lib/learning/review.ts`
- Test: `lib/learning/review.test.ts`

**Interfaces:**
- Consumes: `ReviewState`, `ReviewStatus` from `types/models.ts`; `toISODate`, `addDays` from `lib/learning/date.ts`.
- Produces: `REVIEW_INTERVALS_DAYS: number[]`, `ReviewOutcome = 'again' | 'hard' | 'know'`, `updateReviewState(state, outcome, today?): ReviewState`, `createInitialReviewState(today?): ReviewState`. Used by Tasks 14 (Flashcards), 22 (Homework), 27 (Review page).

- [ ] **Step 1: Write the failing test**

```ts
// lib/learning/review.test.ts
import { describe, it, expect } from 'vitest';
import { updateReviewState, createInitialReviewState, REVIEW_INTERVALS_DAYS } from './review';

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('createInitialReviewState', () => {
  it('creates a fresh new-status state due today', () => {
    const state = createInitialReviewState(TODAY);
    expect(state).toEqual({
      status: 'new',
      level: 0,
      lastReviewed: null,
      nextReviewDate: '2026-09-24',
      correctCount: 0,
      mistakeCount: 0,
    });
  });
});

describe('updateReviewState', () => {
  it('drops level by 2 (floored at 0) and marks learning on "again"', () => {
    const state = { status: 'review' as const, level: 3, lastReviewed: null, nextReviewDate: null, correctCount: 5, mistakeCount: 1 };
    const next = updateReviewState(state, 'again', TODAY);
    expect(next.level).toBe(1);
    expect(next.status).toBe('learning');
    expect(next.mistakeCount).toBe(2);
    expect(next.nextReviewDate).toBe('2026-09-25'); // level 1 -> +1 day
  });

  it('floors level at 0 on "again"', () => {
    const state = createInitialReviewState(TODAY);
    const next = updateReviewState(state, 'again', TODAY);
    expect(next.level).toBe(0);
    expect(next.nextReviewDate).toBe('2026-09-24'); // level 0 -> +0 days
  });

  it('keeps level unchanged on "hard"', () => {
    const state = { status: 'review' as const, level: 2, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 };
    const next = updateReviewState(state, 'hard', TODAY);
    expect(next.level).toBe(2);
    expect(next.status).toBe('review');
  });

  it('raises level by 1 (capped at 5) and increments correctCount on "know"', () => {
    const state = { status: 'review' as const, level: 4, lastReviewed: null, nextReviewDate: null, correctCount: 2, mistakeCount: 0 };
    const next = updateReviewState(state, 'know', TODAY);
    expect(next.level).toBe(5);
    expect(next.status).toBe('known');
    expect(next.correctCount).toBe(3);
    expect(next.nextReviewDate).toBe('2026-10-24'); // level 5 -> +30 days
  });

  it('does not exceed level 5', () => {
    const state = { status: 'known' as const, level: 5, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 };
    const next = updateReviewState(state, 'know', TODAY);
    expect(next.level).toBe(5);
  });

  it('uses REVIEW_INTERVALS_DAYS = [0,1,3,7,14,30]', () => {
    expect(REVIEW_INTERVALS_DAYS).toEqual([0, 1, 3, 7, 14, 30]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/review.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/review.ts`**

```ts
// lib/learning/review.ts
import { ReviewState, ReviewStatus } from '@/types/models';
import { toISODate, addDays } from './date';

export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export type ReviewOutcome = 'again' | 'hard' | 'know';

export function createInitialReviewState(today: Date = new Date()): ReviewState {
  return {
    status: 'new',
    level: 0,
    lastReviewed: null,
    nextReviewDate: toISODate(today),
    correctCount: 0,
    mistakeCount: 0,
  };
}

export function updateReviewState(state: ReviewState, outcome: ReviewOutcome, today: Date = new Date()): ReviewState {
  let level = state.level;
  if (outcome === 'again') level = Math.max(0, level - 2);
  else if (outcome === 'know') level = Math.min(5, level + 1);

  const status: ReviewStatus = level >= 5 ? 'known' : outcome === 'again' ? 'learning' : 'review';

  return {
    status,
    level,
    lastReviewed: toISODate(today),
    nextReviewDate: toISODate(addDays(today, REVIEW_INTERVALS_DAYS[level])),
    correctCount: state.correctCount + (outcome === 'know' ? 1 : 0),
    mistakeCount: state.mistakeCount + (outcome === 'again' ? 1 : 0),
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/learning/review.ts lib/learning/review.test.ts
git commit -m "feat: add spaced-repetition review scoring logic"
```

---

### Task 5: Answer checking logic

**Files:**
- Create: `lib/learning/checkAnswer.ts`
- Test: `lib/learning/checkAnswer.test.ts`

**Interfaces:**
- Produces: `normalizeAnswer(input: string): string`, `isAnswerCorrect(userInput: string, accepted: string[]): boolean`, `isFillBlankItemCorrect(item: FillBlankItem, userAnswers: string[]): boolean`, `isMultipleChoiceItemCorrect(item: MultipleChoiceItem, selectedIndex: number | null): boolean`. Used by Tasks 18 (exercise components), 20, 22.

- [ ] **Step 1: Write the failing test**

```ts
// lib/learning/checkAnswer.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeAnswer, isAnswerCorrect, isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from './checkAnswer';

describe('normalizeAnswer', () => {
  it('trims, lowercases and collapses whitespace', () => {
    expect(normalizeAnswer('  Was   ')).toBe('was');
    expect(normalizeAnswer('I  am   home')).toBe('i am home');
  });
});

describe('isAnswerCorrect', () => {
  it('matches case-insensitively against any accepted answer', () => {
    expect(isAnswerCorrect('Was', ['was'])).toBe(true);
    expect(isAnswerCorrect('wasn t', ["wasn't", 'was not'])).toBe(false);
    expect(isAnswerCorrect('was not', ["wasn't", 'was not'])).toBe(true);
  });

  it('rejects answers not in the accepted list', () => {
    expect(isAnswerCorrect('were', ['was'])).toBe(false);
  });
});

describe('isFillBlankItemCorrect', () => {
  it('requires every blank to match', () => {
    const item = { text: 'She ___ 22, so she ___ 23 now.', blanks: [['was'], ['is']] };
    expect(isFillBlankItemCorrect(item, ['was', 'is'])).toBe(true);
    expect(isFillBlankItemCorrect(item, ['was', 'are'])).toBe(false);
  });
});

describe('isMultipleChoiceItemCorrect', () => {
  it('compares selected index to correctIndex', () => {
    const item = { question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 };
    expect(isMultipleChoiceItemCorrect(item, 1)).toBe(true);
    expect(isMultipleChoiceItemCorrect(item, 0)).toBe(false);
    expect(isMultipleChoiceItemCorrect(item, null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/checkAnswer.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/checkAnswer.ts`**

```ts
// lib/learning/checkAnswer.ts
import { FillBlankItem, MultipleChoiceItem } from '@/types/models';

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isAnswerCorrect(userInput: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(userInput);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

export function isFillBlankItemCorrect(item: FillBlankItem, userAnswers: string[]): boolean {
  return item.blanks.every((accepted, i) => isAnswerCorrect(userAnswers[i] ?? '', accepted));
}

export function isMultipleChoiceItemCorrect(item: MultipleChoiceItem, selectedIndex: number | null): boolean {
  return selectedIndex !== null && selectedIndex === item.correctIndex;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/learning/checkAnswer.ts lib/learning/checkAnswer.test.ts
git commit -m "feat: add answer normalization and checking logic"
```

---

### Task 6: Collection stores (Zustand)

**Files:**
- Create: `lib/storage/createCollectionStore.ts`, `lib/storage/wordsStore.ts`, `lib/storage/phrasesStore.ts`, `lib/storage/grammarStore.ts`, `lib/storage/exercisesStore.ts`, `lib/storage/homeworkStore.ts`, `lib/storage/settingsStore.ts`
- Test: `lib/storage/createCollectionStore.test.ts`, `lib/storage/settingsStore.test.ts`

**Interfaces:**
- Consumes: `StorageAdapter`, `localStorageAdapter` from Task 3; `Word`, `Phrase`, `GrammarTopic`, `Exercise`, `Homework` from Task 2.
- Produces: `createCollectionStore<T>(collection: string, adapter: StorageAdapter)` returning a Zustand hook with shape `{ items: T[]; hydrated: boolean; hydrate: () => void; add: (item: T) => void; update: (item: T) => void; remove: (id: string) => void }`; concrete stores `useWordsStore`, `usePhrasesStore`, `useGrammarStore`, `useExercisesStore`, `useHomeworkStore`; `useSettingsStore` with `{ theme: 'light'|'dark'|'system'; streak: number; lastActiveDate: string|null; hydrated: boolean; hydrate: () => void; setTheme: (t) => void; recordActivity: (today?: Date) => void }`. Used by every UI task from Task 8 onward.

- [ ] **Step 1: Write the failing test for the generic store factory**

```ts
// lib/storage/createCollectionStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

interface Item { id: string; value: string; }

describe('createCollectionStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty and not hydrated', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    expect(useStore.getState().items).toEqual([]);
    expect(useStore.getState().hydrated).toBe(false);
  });

  it('hydrates from the adapter', () => {
    localStorageAdapter.set('test-items', { id: '1', value: 'a' });
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().hydrate();
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'a' }]);
    expect(useStore.getState().hydrated).toBe(true);
  });

  it('add() persists via the adapter and updates state', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'a' }]);
    expect(localStorageAdapter.list<Item>('test-items')).toEqual([{ id: '1', value: 'a' }]);
  });

  it('update() replaces an existing item', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    useStore.getState().update({ id: '1', value: 'b' });
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'b' }]);
  });

  it('remove() deletes an item', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    useStore.getState().remove('1');
    expect(useStore.getState().items).toEqual([]);
    expect(localStorageAdapter.list<Item>('test-items')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/storage/createCollectionStore.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/storage/createCollectionStore.ts`**

```ts
// lib/storage/createCollectionStore.ts
import { create } from 'zustand';
import { StorageAdapter } from './types';

export interface CollectionState<T> {
  items: T[];
  hydrated: boolean;
  hydrate: () => void;
  add: (item: T) => void;
  update: (item: T) => void;
  remove: (id: string) => void;
}

export function createCollectionStore<T extends { id: string }>(
  collection: string,
  adapter: StorageAdapter
) {
  return create<CollectionState<T>>((set, get) => ({
    items: [],
    hydrated: false,
    hydrate: () => {
      set({ items: adapter.list<T>(collection), hydrated: true });
    },
    add: (item) => {
      adapter.set(collection, item);
      set({ items: [...get().items, item] });
    },
    update: (item) => {
      adapter.set(collection, item);
      set({ items: get().items.map((i) => (i.id === item.id ? item : i)) });
    },
    remove: (id) => {
      adapter.remove(collection, id);
      set({ items: get().items.filter((i) => i.id !== id) });
    },
  }));
}
```

- [ ] **Step 4: Implement the concrete collection stores**

```ts
// lib/storage/wordsStore.ts
import { Word } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useWordsStore = createCollectionStore<Word>('words', localStorageAdapter);
```

```ts
// lib/storage/phrasesStore.ts
import { Phrase } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const usePhrasesStore = createCollectionStore<Phrase>('phrases', localStorageAdapter);
```

```ts
// lib/storage/grammarStore.ts
import { GrammarTopic } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useGrammarStore = createCollectionStore<GrammarTopic>('grammarTopics', localStorageAdapter);
```

```ts
// lib/storage/exercisesStore.ts
import { Exercise } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useExercisesStore = createCollectionStore<Exercise>('exercises', localStorageAdapter);
```

```ts
// lib/storage/homeworkStore.ts
import { Homework } from '@/types/models';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

export const useHomeworkStore = createCollectionStore<Homework>('homeworks', localStorageAdapter);
```

- [ ] **Step 5: Write the failing test for the settings store**

```ts
// lib/storage/settingsStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, hydrated: false });
  });

  it('defaults to system theme', () => {
    expect(useSettingsStore.getState().theme).toBe('system');
  });

  it('setTheme persists and updates state', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('recordActivity starts a streak at 1 on first activity', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
    expect(useSettingsStore.getState().lastActiveDate).toBe('2026-09-24');
  });

  it('recordActivity increments streak on the following day', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-25T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(2);
  });

  it('recordActivity resets streak to 1 after a gap', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-27T00:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
  });

  it('recordActivity is idempotent within the same day', () => {
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T00:00:00Z'));
    useSettingsStore.getState().recordActivity(new Date('2026-09-24T12:00:00Z'));
    expect(useSettingsStore.getState().streak).toBe(1);
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- lib/storage/settingsStore.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `lib/storage/settingsStore.ts`**

```ts
// lib/storage/settingsStore.ts
import { create } from 'zustand';
import { toISODate, addDays } from '@/lib/learning/date';
import { localStorageAdapter } from './localStorageAdapter';

export type Theme = 'light' | 'dark' | 'system';

interface SettingsRecord {
  id: 'singleton';
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
}

interface SettingsState {
  theme: Theme;
  streak: number;
  lastActiveDate: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  recordActivity: (today?: Date) => void;
}

function persist(state: Pick<SettingsState, 'theme' | 'streak' | 'lastActiveDate'>) {
  localStorageAdapter.set<SettingsRecord>('settings', { id: 'singleton', ...state });
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  streak: 0,
  lastActiveDate: null,
  hydrated: false,
  hydrate: () => {
    const record = localStorageAdapter.get<SettingsRecord>('settings', 'singleton');
    if (record) set({ theme: record.theme, streak: record.streak, lastActiveDate: record.lastActiveDate, hydrated: true });
    else set({ hydrated: true });
  },
  setTheme: (theme) => {
    set({ theme });
    persist({ theme, streak: get().streak, lastActiveDate: get().lastActiveDate });
  },
  recordActivity: (today = new Date()) => {
    const todayStr = toISODate(today);
    const { lastActiveDate, streak, theme } = get();
    if (lastActiveDate === todayStr) return;
    const yesterday = toISODate(addDays(today, -1));
    const newStreak = lastActiveDate === yesterday ? streak + 1 : 1;
    set({ streak: newStreak, lastActiveDate: todayStr });
    persist({ theme, streak: newStreak, lastActiveDate: todayStr });
  },
}));
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/storage/createCollectionStore.ts lib/storage/wordsStore.ts lib/storage/phrasesStore.ts lib/storage/grammarStore.ts lib/storage/exercisesStore.ts lib/storage/homeworkStore.ts lib/storage/settingsStore.ts lib/storage/createCollectionStore.test.ts lib/storage/settingsStore.test.ts
git commit -m "feat: add Zustand collection stores and settings store"
```

---

### Task 7: Seed data

**Files:**
- Create: `lib/seed/words.ts`, `lib/seed/phrases.ts`, `lib/seed/grammar.ts`, `lib/seed/loadSeedIfEmpty.ts`
- Test: `lib/seed/loadSeedIfEmpty.test.ts`

**Interfaces:**
- Consumes: `createInitialReviewState` from Task 4; `useWordsStore`, `usePhrasesStore`, `useGrammarStore` from Task 6; `generateId` from Task 1.
- Produces: `seedWords: Word[]`, `seedPhrases: Phrase[]`, `seedGrammarTopics: GrammarTopic[]`, `loadSeedIfEmpty(): void`. Used by Task 8 (hydration).

- [ ] **Step 1: Implement `lib/seed/words.ts`**

```ts
// lib/seed/words.ts
import { Word } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

function w(partial: Omit<Word, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Word {
  return {
    id: `seed-word-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-24',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-24T00:00:00Z')),
    ...partial,
  };
}

export const seedWords: Word[] = [
  w({ english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', ruPronunciation: 'мадэр / мазэр', example: 'My mother is at home.', exampleTranslation: 'Моя мама дома.', category: 'Family' }),
  w({ english: 'father', translation: 'папа', ipa: 'ˈfɑːðər', ruPronunciation: 'фазэр', example: 'My father works a lot.', exampleTranslation: 'Мой папа много работает.', category: 'Family' }),
  w({ english: 'chair', translation: 'стул', ipa: 'tʃer', ruPronunciation: 'чэйр', example: 'This is a chair.', exampleTranslation: 'Это стул.', category: 'Home' }),
  w({ english: 'table', translation: 'стол', ipa: 'ˈteɪbəl', ruPronunciation: 'тэйбл', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'Home' }),
  w({ english: 'fridge', translation: 'холодильник', ipa: 'frɪdʒ', ruPronunciation: 'фридж', example: 'The milk is in the fridge.', exampleTranslation: 'Молоко в холодильнике.', category: 'Home' }),
  w({ english: 'window', translation: 'окно', ipa: 'ˈwɪndoʊ', ruPronunciation: 'уиндоу', example: 'Open the window, please.', exampleTranslation: 'Открой окно, пожалуйста.', category: 'Home' }),
  w({ english: 'bread', translation: 'хлеб', ipa: 'bred', ruPronunciation: 'брэд', example: 'I need to buy some bread.', exampleTranslation: 'Мне нужно купить хлеб.', category: 'Food' }),
  w({ english: 'water', translation: 'вода', ipa: 'ˈwɔːtər', ruPronunciation: 'уотэр', example: 'Can I have some water?', exampleTranslation: 'Можно мне воды?', category: 'Food' }),
  w({ english: 'friend', translation: 'друг', ipa: 'frend', ruPronunciation: 'фрэнд', example: 'She is my best friend.', exampleTranslation: 'Она моя лучшая подруга.', category: 'People' }),
  w({ english: 'teacher', translation: 'учитель', ipa: 'ˈtiːtʃər', ruPronunciation: 'тичэр', example: 'My teacher is very kind.', exampleTranslation: 'Мой учитель очень добрый.', category: 'People' }),
  w({ english: 'street', translation: 'улица', ipa: 'striːt', ruPronunciation: 'стрит', example: 'We live on a quiet street.', exampleTranslation: 'Мы живём на тихой улице.', category: 'Travel' }),
  w({ english: 'airport', translation: 'аэропорт', ipa: 'ˈerpɔːrt', ruPronunciation: 'эаропорт', example: 'The airport is far from here.', exampleTranslation: 'Аэропорт далеко отсюда.', category: 'Travel' }),
  w({ english: 'left', translation: 'налево', ipa: 'left', ruPronunciation: 'лэфт', example: 'Turn left at the corner.', exampleTranslation: 'Поверни налево на углу.', category: 'Directions' }),
  w({ english: 'right', translation: 'направо', ipa: 'raɪt', ruPronunciation: 'райт', example: 'Turn right at the light.', exampleTranslation: 'Поверни направо на светофоре.', category: 'Directions' }),
  w({ english: 'meeting', translation: 'встреча', ipa: 'ˈmiːtɪŋ', ruPronunciation: 'митинг', example: 'The meeting starts at 9.', exampleTranslation: 'Встреча начинается в 9.', category: 'Work' }),
  w({ english: 'deadline', translation: 'срок сдачи', ipa: 'ˈdedlaɪn', ruPronunciation: 'дэдлайн', example: 'The deadline is Friday.', exampleTranslation: 'Срок сдачи — пятница.', category: 'Work' }),
  w({ english: 'morning', translation: 'утро', ipa: 'ˈmɔːrnɪŋ', ruPronunciation: 'морнинг', example: 'I run every morning.', exampleTranslation: 'Я бегаю каждое утро.', category: 'Daily Life' }),
  w({ english: 'tired', translation: 'уставший', ipa: 'ˈtaɪərd', ruPronunciation: 'тайэрд', example: "I'm tired today.", exampleTranslation: 'Я устал сегодня.', category: 'Daily Life' }),
];
```

- [ ] **Step 2: Implement `lib/seed/phrases.ts`**

```ts
// lib/seed/phrases.ts
import { Phrase } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

function p(partial: Omit<Phrase, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Phrase {
  return {
    id: `seed-phrase-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-24',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-24T00:00:00Z')),
    ...partial,
  };
}

export const seedPhrases: Phrase[] = [
  p({ english: 'How are you?', translation: 'Как дела?', ipa: 'haʊ ɑːr juː', ruPronunciation: 'хау ар ю', category: 'Phrases' }),
  p({ english: 'Nice to meet you.', translation: 'Приятно познакомиться.', ipa: 'naɪs tuː miːt juː', ruPronunciation: 'найс ту мит ю', category: 'Phrases' }),
  p({ english: 'What time is it?', translation: 'Который час?', ipa: 'wɒt taɪm ɪz ɪt', ruPronunciation: 'вот тайм из ит', category: 'Phrases' }),
  p({ english: 'I have no idea.', translation: 'Понятия не имею.', ipa: 'aɪ hæv noʊ aɪˈdiːə', ruPronunciation: 'ай хэв ноу айдиа', category: 'Phrases' }),
];
```

- [ ] **Step 3: Implement `lib/seed/grammar.ts`**

```ts
// lib/seed/grammar.ts
import { GrammarTopic } from '@/types/models';

export const seedGrammarTopics: GrammarTopic[] = [
  {
    id: 'seed-grammar-there-is-are',
    title: 'There is / There are',
    explanation: 'There is используется с одним предметом (единственное число). There are используется с несколькими предметами (множественное число).',
    examples: ['There is a chair in the room.', 'There are two chairs in the room.'],
    practiceExercises: [
      {
        id: 'seed-grammar-there-is-are-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вариант.',
        items: [
          { question: '___ a sofa in the room.', options: ['There is', 'There are'], correctIndex: 0 },
          { question: '___ three books on the table.', options: ['There is', 'There are'], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-24',
  },
  {
    id: 'seed-grammar-was-were',
    title: 'was / were (Past Simple of "to be")',
    explanation: 'was используется с I/he/she/it, were — с you/we/they. В вопросах и отрицаниях were/wasn\'t /weren\'t ставится перед подлежащим или после него по тем же правилам.',
    examples: ['She was 22 last year.', 'They were here a few minutes ago.'],
    practiceExercises: [
      {
        id: 'seed-grammar-was-were-ex1',
        type: 'fill-blank',
        instruction: 'Заполните пропуски, используя was/were.',
        items: [
          { text: 'Last year she ___ 22, so she is 23 now.', blanks: [['was']] },
          { text: 'They ___ very expensive.', blanks: [['were']] },
        ],
      },
    ],
  },
];
```

- [ ] **Step 4: Write the failing test for the seed loader**

```ts
// lib/seed/loadSeedIfEmpty.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadSeedIfEmpty } from './loadSeedIfEmpty';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';

describe('loadSeedIfEmpty', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: false });
    usePhrasesStore.setState({ items: [], hydrated: false });
    useGrammarStore.setState({ items: [], hydrated: false });
  });

  it('populates all three stores when empty', () => {
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items.length).toBeGreaterThan(0);
    expect(usePhrasesStore.getState().items.length).toBeGreaterThan(0);
    expect(useGrammarStore.getState().items.length).toBeGreaterThan(0);
  });

  it('does not duplicate seed data on a second call', () => {
    loadSeedIfEmpty();
    const firstCount = useWordsStore.getState().items.length;
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items.length).toBe(firstCount);
  });

  it('does not overwrite existing user data', () => {
    useWordsStore.getState().add({
      id: 'user-word-1',
      english: 'custom',
      translation: 'своё',
      category: 'Other',
      tags: [],
      dateAdded: '2026-09-24',
      review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
    });
    loadSeedIfEmpty();
    expect(useWordsStore.getState().items).toEqual([expect.objectContaining({ id: 'user-word-1' })]);
  });
});
```

- [ ] **Step 5: Run test, verify it fails**

Run: `npm run test -- lib/seed/loadSeedIfEmpty.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 6: Implement `lib/seed/loadSeedIfEmpty.ts`**

```ts
// lib/seed/loadSeedIfEmpty.ts
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { seedWords } from './words';
import { seedPhrases } from './phrases';
import { seedGrammarTopics } from './grammar';

export function loadSeedIfEmpty(): void {
  const words = useWordsStore.getState();
  if (words.items.length === 0) seedWords.forEach((item) => words.add(item));

  const phrases = usePhrasesStore.getState();
  if (phrases.items.length === 0) seedPhrases.forEach((item) => phrases.add(item));

  const grammar = useGrammarStore.getState();
  if (grammar.items.length === 0) seedGrammarTopics.forEach((item) => grammar.add(item));
}
```

- [ ] **Step 7: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add lib/seed
git commit -m "feat: add seed vocabulary/phrases/grammar and auto-seed loader"
```

---

### Task 8: Store hydration, root layout, theme toggle

**Files:**
- Create: `components/layout/StoreHydrator.tsx`, `components/layout/ThemeToggle.tsx`
- Modify: `app/layout.tsx`
- Test: `components/layout/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `useWordsStore`, `usePhrasesStore`, `useGrammarStore`, `useExercisesStore`, `useHomeworkStore`, `useSettingsStore` from Task 6; `loadSeedIfEmpty` from Task 7.
- Produces: `<StoreHydrator>` (mounts once in root layout, hydrates all stores + applies seed + applies theme class to `<html>`); `<ThemeToggle>` component. Used by Task 9 (nav) and every page after.

- [ ] **Step 1: Implement `components/layout/StoreHydrator.tsx`**

```tsx
// components/layout/StoreHydrator.tsx
'use client';

import { useEffect } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { loadSeedIfEmpty } from '@/lib/seed/loadSeedIfEmpty';

export function StoreHydrator() {
  useEffect(() => {
    useWordsStore.getState().hydrate();
    usePhrasesStore.getState().hydrate();
    useGrammarStore.getState().hydrate();
    useExercisesStore.getState().hydrate();
    useHomeworkStore.getState().hydrate();
    useSettingsStore.getState().hydrate();
    loadSeedIfEmpty();
  }, []);

  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  return null;
}
```

- [ ] **Step 2: Write the failing test for ThemeToggle**

```tsx
// components/layout/ThemeToggle.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useSettingsStore } from '@/lib/storage/settingsStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: 'light', streak: 0, lastActiveDate: null, hydrated: true });
  });

  it('shows the current theme and toggles to dark on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(button);
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('toggles back to light from dark', () => {
    useSettingsStore.setState({ theme: 'dark' });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /theme/i }));
    expect(useSettingsStore.getState().theme).toBe('light');
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npm run test -- components/layout/ThemeToggle.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 4: Implement `components/layout/ThemeToggle.tsx`**

```tsx
// components/layout/ThemeToggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Toggle theme"
      className={cn('rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 5: Wire `StoreHydrator` into `app/layout.tsx`**

```tsx
// app/layout.tsx
import './globals.css';
import { StoreHydrator } from '@/components/layout/StoreHydrator';

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Run `npm run build` to confirm the app still compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add components/layout/StoreHydrator.tsx components/layout/ThemeToggle.tsx components/layout/ThemeToggle.test.tsx app/layout.tsx
git commit -m "feat: hydrate stores on load and add theme toggle"
```

---

### Task 9: Navigation shell

**Files:**
- Create: `components/layout/Nav.tsx`
- Modify: `app/layout.tsx`
- Test: `components/layout/Nav.test.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` from Task 8.
- Produces: `<Nav>` rendering the 7 top-level sections as links (desktop sidebar, mobile bottom bar via Tailwind responsive classes). Used by `app/layout.tsx` for the rest of the plan.

- [ ] **Step 1: Write the failing test**

```tsx
// components/layout/Nav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Nav', () => {
  it('renders a link for every top-level section', () => {
    render(<Nav />);
    ['Home', 'Vocabulary', 'Phrases', 'Grammar', 'Exercises', 'Homework', 'Review', 'Progress', 'Add New'].forEach((label) => {
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/layout/Nav.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/layout/Nav.tsx`**

```tsx
// components/layout/Nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageSquare, GraduationCap, PenLine, ClipboardList, RotateCcw, BarChart3, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/vocabulary', label: 'Vocabulary', icon: BookOpen },
  { href: '/phrases', label: 'Phrases', icon: MessageSquare },
  { href: '/grammar', label: 'Grammar', icon: GraduationCap },
  { href: '/exercises', label: 'Exercises', icon: PenLine },
  { href: '/homework', label: 'Homework', icon: ClipboardList },
  { href: '/review', label: 'Review', icon: RotateCcw },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/add', label: 'Add New', icon: PlusCircle },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:p-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-lg font-bold">MJay English</span>
          <ThemeToggle />
        </div>
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10',
              pathname === href && 'bg-black/10 font-medium dark:bg-white/15'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-white/95 p-1 backdrop-blur md:hidden dark:bg-gray-950/95">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn('flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px]', pathname === href && 'text-blue-600 dark:text-blue-400')}
          >
            <Icon size={18} />
          </Link>
        ))}
      </nav>
    </>
  );
}
```

- [ ] **Step 4: Wire `Nav` into `app/layout.tsx`**

```tsx
// app/layout.tsx
import './globals.css';
import { StoreHydrator } from '@/components/layout/StoreHydrator';
import { Nav } from '@/components/layout/Nav';

export const metadata = { title: 'MJay English' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <StoreHydrator />
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/layout/Nav.tsx components/layout/Nav.test.tsx app/layout.tsx
git commit -m "feat: add responsive navigation shell"
```

---

## Phase B — Vocabulary & Phrases

### Task 10: Pronunciation wrapper and Listen button

**Files:**
- Create: `lib/pronunciation/speak.ts`, `components/shared/ListenButton.tsx`
- Test: `lib/pronunciation/speak.test.ts`, `components/shared/ListenButton.test.tsx`

**Interfaces:**
- Produces: `isSpeechSupported(): boolean`, `speak(text: string, lang?: string): void` from `lib/pronunciation/speak.ts`; `<ListenButton text={string} lang?={string} />`. Used by Tasks 11, 14, 16.

- [ ] **Step 1: Write the failing test for `speak`**

```ts
// lib/pronunciation/speak.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSpeechSupported, speak } from './speak';

describe('isSpeechSupported', () => {
  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
  });

  it('returns false when speechSynthesis is not available', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
  });

  it('returns true when speechSynthesis is available', () => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    expect(isSpeechSupported()).toBe(true);
  });
});

describe('speak', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
  });

  it('cancels any ongoing speech and speaks the given text', () => {
    speak('mother', 'en-US');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('does nothing when speech is unsupported', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    expect(() => speak('mother')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/pronunciation/speak.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/pronunciation/speak.ts`**

```ts
// lib/pronunciation/speak.ts
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang: string = 'en-US'): void {
  if (!isSpeechSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/pronunciation/speak.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `ListenButton`**

```tsx
// components/shared/ListenButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListenButton } from './ListenButton';

describe('ListenButton', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  it('speaks the given text on click', () => {
    render(<ListenButton text="mother" />);
    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('renders nothing when speech is unsupported', () => {
    // @ts-expect-error cleanup test global
    delete window.speechSynthesis;
    const { container } = render(<ListenButton text="mother" />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/shared/ListenButton.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/shared/ListenButton.tsx`**

```tsx
// components/shared/ListenButton.tsx
'use client';

import { Volume2 } from 'lucide-react';
import { isSpeechSupported, speak } from '@/lib/pronunciation/speak';
import { cn } from '@/lib/utils';

interface ListenButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

export function ListenButton({ text, lang = 'en-US', className }: ListenButtonProps) {
  if (!isSpeechSupported()) return null;

  return (
    <button
      type="button"
      aria-label="Listen"
      className={cn('inline-flex items-center gap-1 rounded-full p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950', className)}
      onClick={() => speak(text, lang)}
    >
      <Volume2 size={16} />
    </button>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/pronunciation components/shared/ListenButton.tsx components/shared/ListenButton.test.tsx
git commit -m "feat: add Web Speech API wrapper and Listen button"
```

---

### Task 11: Word/Phrase form

**Files:**
- Create: `components/vocabulary/VocabForm.tsx`
- Test: `components/vocabulary/VocabForm.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2; `createInitialReviewState` from Task 4; `generateId` from Task 1; `ListenButton` from Task 10.
- Produces: `<VocabForm initial?={VocabItem} onSubmit={(item: VocabItem) => void} onCancel?={() => void} />`. Used by Tasks 12 (Add New) and 17 (inline edit in VocabSection).

- [ ] **Step 1: Write the failing test**

```tsx
// components/vocabulary/VocabForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabForm } from './VocabForm';

describe('VocabForm', () => {
  it('requires english, translation and category before submitting', () => {
    const onSubmit = vi.fn();
    render(<VocabForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('submits a new item with the entered values', () => {
    const onSubmit = vi.fn();
    render(<VocabForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByLabelText(/translation/i), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.english).toBe('dog');
    expect(submitted.translation).toBe('собака');
    expect(submitted.category).toBe('Other');
    expect(submitted.id).toBeTruthy();
  });

  it('pre-fills fields when editing an existing item', () => {
    const existing = {
      id: 'w1', english: 'cat', translation: 'кот', category: 'Other', tags: [], dateAdded: '2026-09-24',
      review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
    };
    render(<VocabForm initial={existing} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/english/i)).toHaveValue('cat');
    expect(screen.getByLabelText(/translation/i)).toHaveValue('кот');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/vocabulary/VocabForm.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/vocabulary/VocabForm.tsx`**

```tsx
// components/vocabulary/VocabForm.tsx
'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { generateId } from '@/lib/utils';
import { createInitialReviewState } from '@/lib/learning/review';
import { ListenButton } from '@/components/shared/ListenButton';

interface VocabFormProps {
  initial?: VocabItem;
  onSubmit: (item: VocabItem) => void;
  onCancel?: () => void;
}

const CATEGORIES = ['Home', 'Food', 'Family', 'People', 'Travel', 'Directions', 'Work', 'Daily Life', 'Grammar', 'Phrases', 'Other'];

export function VocabForm({ initial, onSubmit, onCancel }: VocabFormProps) {
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');
  const [ipa, setIpa] = useState(initial?.ipa ?? '');
  const [ruPronunciation, setRuPronunciation] = useState(initial?.ruPronunciation ?? '');
  const [example, setExample] = useState(initial?.example ?? '');
  const [exampleTranslation, setExampleTranslation] = useState(initial?.exampleTranslation ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim() || !translation.trim() || !category.trim()) {
      setError('English, translation and category are required.');
      return;
    }
    setError(null);
    onSubmit({
      id: initial?.id ?? generateId(),
      english: english.trim(),
      translation: translation.trim(),
      ipa: ipa.trim() || undefined,
      ruPronunciation: ruPronunciation.trim() || undefined,
      example: example.trim() || undefined,
      exampleTranslation: exampleTranslation.trim() || undefined,
      category: category.trim(),
      tags: initial?.tags ?? [],
      dateAdded: initial?.dateAdded ?? new Date().toISOString().slice(0, 10),
      review: initial?.review ?? createInitialReviewState(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        English
        <span className="flex items-center gap-2">
          <input className="flex-1 rounded border px-2 py-1" value={english} onChange={(e) => setEnglish(e.target.value)} />
          {english && <ListenButton text={english} />}
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Translation
        <input className="rounded border px-2 py-1" value={translation} onChange={(e) => setTranslation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        IPA pronunciation
        <input className="rounded border px-2 py-1" value={ipa} onChange={(e) => setIpa(e.target.value)} placeholder="/ˈmʌðər/" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Russian pronunciation
        <input className="rounded border px-2 py-1" value={ruPronunciation} onChange={(e) => setRuPronunciation(e.target.value)} placeholder="мадэр / мазэр" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Example
        <input className="rounded border px-2 py-1" value={example} onChange={(e) => setExample(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Example translation
        <input className="rounded border px-2 py-1" value={exampleTranslation} onChange={(e) => setExampleTranslation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <input className="rounded border px-2 py-1" list="vocab-categories" value={category} onChange={(e) => setCategory(e.target.value)} />
        <datalist id="vocab-categories">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded border px-4 py-2 text-sm">Cancel</button>}
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/vocabulary/VocabForm.tsx components/vocabulary/VocabForm.test.tsx
git commit -m "feat: add shared word/phrase add-edit form"
```

---

### Task 12: Add New page (Word / Phrase)

**Files:**
- Create: `app/add/page.tsx`
- Test: `app/add/page.test.tsx`

**Interfaces:**
- Consumes: `VocabForm` from Task 11; `useWordsStore`, `usePhrasesStore` from Task 6.
- Produces: `/add` route with a type selector (Word/Phrase active in this task; Grammar/Exercise/Note wired in Tasks 19, 20). Used as the entry point referenced by Nav (Task 9, already linked).

- [ ] **Step 1: Write the failing test**

```tsx
// app/add/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';

describe('AddPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
  });

  it('adds a word to the words store by default', () => {
    render(<AddPage />);
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByLabelText(/translation/i), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(useWordsStore.getState().items).toHaveLength(1);
    expect(usePhrasesStore.getState().items).toHaveLength(0);
  });

  it('adds to the phrases store when Phrase type is selected', () => {
    render(<AddPage />);
    fireEvent.click(screen.getByRole('button', { name: /^phrase$/i }));
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'How are you?' } });
    fireEvent.change(screen.getByLabelText(/translation/i), { target: { value: 'Как дела?' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Phrases' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(usePhrasesStore.getState().items).toHaveLength(1);
    expect(useWordsStore.getState().items).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- app/add/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `app/add/page.tsx`**

```tsx
// app/add/page.tsx
'use client';

import { useState } from 'react';
import { VocabForm } from '@/components/vocabulary/VocabForm';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { cn } from '@/lib/utils';

type MaterialType = 'Word' | 'Phrase' | 'Grammar' | 'Exercise' | 'Note';

const TYPES: MaterialType[] = ['Word', 'Phrase', 'Grammar', 'Exercise', 'Note'];

export default function AddPage() {
  const [type, setType] = useState<MaterialType>('Word');
  const addWord = useWordsStore((s) => s.add);
  const addPhrase = usePhrasesStore((s) => s.add);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">+ Add New</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            className={cn('rounded-full border px-3 py-1 text-sm', type === t && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {(type === 'Word' || type === 'Phrase') && (
        <VocabForm
          key={type}
          onSubmit={(item) => {
            if (type === 'Word') addWord(item);
            else addPhrase(item);
            setSavedMessage(`${type} saved.`);
          }}
        />
      )}
      {type === 'Grammar' && <p className="text-sm text-gray-500">Grammar topics are authored from the Grammar page (Task 19).</p>}
      {type === 'Exercise' && <p className="text-sm text-gray-500">Exercise authoring is available from the Exercises page (Task 20).</p>}
      {type === 'Note' && <p className="text-sm text-gray-500">Free-form notes are not part of Phase 1.</p>}

      {savedMessage && <p className="mt-3 text-sm text-green-600">{savedMessage}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/add/page.tsx app/add/page.test.tsx
git commit -m "feat: add /add page for creating words and phrases"
```

---

### Task 13: Vocabulary table view

**Files:**
- Create: `components/vocabulary/VocabTable.tsx`
- Test: `components/vocabulary/VocabTable.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2.
- Produces: `<VocabTable items={VocabItem[]} onEdit={(item) => void} onDelete={(id) => void} />` with column-visibility toggles (👁 English/Translation/Pronunciation/Example), 🔀 Random, 🔒 Hide All, and text search. Used by Task 17.

- [ ] **Step 1: Write the failing test**

```tsx
// components/vocabulary/VocabTable.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabTable } from './VocabTable';
import { VocabItem } from '@/types/models';

const items: VocabItem[] = [
  { id: '1', english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', example: 'My mother is at home.', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', ipa: 'tʃer', example: 'This is a chair.', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('VocabTable', () => {
  it('renders every item english and translation by default', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.getByText('мама')).toBeInTheDocument();
  });

  it('hides the English column and shows placeholders when toggled off', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.getAllByText('???').length).toBeGreaterThan(0);
  });

  it('reveals a hidden cell on click', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    fireEvent.click(screen.getAllByText('???')[0]);
    expect(screen.getByText('mother')).toBeInTheDocument();
  });

  it('Hide All hides every togglable column', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /hide all/i }));
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.queryByText('мама')).not.toBeInTheDocument();
  });

  it('filters items by search text', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'стул' } });
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.getByText('chair')).toBeInTheDocument();
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/vocabulary/VocabTable.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/vocabulary/VocabTable.tsx`**

```tsx
// components/vocabulary/VocabTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { Shuffle, Eye, EyeOff, Lock, Pencil, Trash2 } from 'lucide-react';
import { VocabItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface VocabTableProps {
  items: VocabItem[];
  onEdit: (item: VocabItem) => void;
  onDelete: (id: string) => void;
}

type Column = 'english' | 'translation' | 'pronunciation' | 'example';
const COLUMNS: { key: Column; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'translation', label: 'Translation' },
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'example', label: 'Example' },
];

export function VocabTable({ items, onEdit, onDelete }: VocabTableProps) {
  const [visible, setVisible] = useState<Record<Column, boolean>>({ english: true, translation: true, pronunciation: true, example: true });
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[] | null>(null);
  const [search, setSearch] = useState('');

  function toggleColumn(col: Column) {
    setVisible((v) => ({ ...v, [col]: !v[col] }));
  }

  function hideAll() {
    setVisible({ english: false, translation: false, pronunciation: false, example: false });
    setRevealed(new Set());
  }

  function shuffle() {
    const ids = items.map((i) => i.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder(ids);
  }

  function reveal(cellKey: string) {
    setRevealed((prev) => new Set(prev).add(cellKey));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? items.filter((i) => i.english.toLowerCase().includes(q) || i.translation.toLowerCase().includes(q))
      : items;
    if (!order) return base;
    const byId = new Map(base.map((i) => [i.id, i]));
    return order.map((id) => byId.get(id)).filter((i): i is VocabItem => Boolean(i));
  }, [items, search, order]);

  function cellValue(item: VocabItem, col: Column): string {
    if (col === 'english') return item.english;
    if (col === 'translation') return item.translation;
    if (col === 'pronunciation') return item.ipa ?? item.ruPronunciation ?? '—';
    return item.example ?? '—';
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            className={cn('flex items-center gap-1 rounded-full border px-2 py-1 text-xs', visible[col.key] ? 'bg-gray-100 dark:bg-gray-800' : 'opacity-50')}
            onClick={() => toggleColumn(col.key)}
          >
            {visible[col.key] ? <Eye size={14} /> : <EyeOff size={14} />} {col.label}
          </button>
        ))}
        <button className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs" onClick={shuffle}>
          <Shuffle size={14} /> Random
        </button>
        <button className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs" onClick={hideAll}>
          <Lock size={14} /> Hide All
        </button>
        <input
          className="ml-auto rounded border px-2 py-1 text-xs"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b">
              {COLUMNS.filter((c) => visible[c.key]).map((c) => <th key={c.key} className="px-2 py-1 font-medium">{c.label}</th>)}
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                {COLUMNS.filter((c) => visible[c.key]).map((c) => {
                  const cellKey = `${item.id}-${c.key}`;
                  const isRevealed = revealed.has(cellKey);
                  return (
                    <td key={c.key} className="px-2 py-1">
                      <button type="button" className="text-left" onClick={() => reveal(cellKey)}>
                        {isRevealed || visible[c.key] ? cellValue(item, c.key) : '???'}
                      </button>
                    </td>
                  );
                })}
                <td className="flex gap-1 px-2 py-1">
                  <button aria-label="Edit" onClick={() => onEdit(item)}><Pencil size={14} /></button>
                  <button aria-label="Delete" onClick={() => onDelete(item.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Note: when a column's `visible[col]` is `true` the cell already shows the real value (no need to click); the "click-to-reveal `???`" behavior from the test applies to columns toggled *off*. The implementation above shows `???` whenever `!visible[c.key] && !isRevealed` — re-check: the JSX condition `isRevealed || visible[c.key] ? value : '???'` already encodes exactly that.

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/vocabulary/VocabTable.tsx components/vocabulary/VocabTable.test.tsx
git commit -m "feat: add vocabulary table view with column hide/show and search"
```

---

### Task 14: Flashcards

**Files:**
- Create: `components/flashcards/Flashcard.tsx`, `components/flashcards/FlashcardDeck.tsx`
- Test: `components/flashcards/Flashcard.test.tsx`, `components/flashcards/FlashcardDeck.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2; `updateReviewState`, `ReviewOutcome` from Task 4; `ListenButton` from Task 10.
- Produces: `<Flashcard item={VocabItem} direction={'en-ru'|'ru-en'} onOutcome={(outcome: ReviewOutcome) => void} />`; `<FlashcardDeck items={VocabItem[]} onUpdateItem={(item: VocabItem) => void} />` (owns direction toggle + deck progression). Used by Task 17 and Task 27 (Review page).

- [ ] **Step 1: Write the failing test for `Flashcard`**

```tsx
// components/flashcards/Flashcard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flashcard } from './Flashcard';

const item = {
  id: '1', english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', example: 'My mother is at home.',
  category: 'Family', tags: [], dateAdded: '2026-09-24',
  review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
};

describe('Flashcard', () => {
  it('shows only the front (english) before reveal in en-ru direction', () => {
    render(<Flashcard item={item} direction="en-ru" onOutcome={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.queryByText('мама')).not.toBeInTheDocument();
  });

  it('shows only the translation before reveal in ru-en direction', () => {
    render(<Flashcard item={item} direction="ru-en" onOutcome={vi.fn()} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
  });

  it('reveals the back on tap', () => {
    render(<Flashcard item={item} direction="en-ru" onOutcome={vi.fn()} />);
    fireEvent.click(screen.getByText(/tap to reveal/i));
    expect(screen.getByText('мама')).toBeInTheDocument();
    expect(screen.getByText('ˈmʌðər')).toBeInTheDocument();
  });

  it('calls onOutcome with "know" / "hard" / "again" and resets reveal', () => {
    const onOutcome = vi.fn();
    render(<Flashcard item={item} direction="en-ru" onOutcome={onOutcome} />);
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: /know/i }));
    expect(onOutcome).toHaveBeenCalledWith('know');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/flashcards/Flashcard.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/flashcards/Flashcard.tsx`**

```tsx
// components/flashcards/Flashcard.tsx
'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { ReviewOutcome } from '@/lib/learning/review';
import { ListenButton } from '@/components/shared/ListenButton';

interface FlashcardProps {
  item: VocabItem;
  direction: 'en-ru' | 'ru-en';
  onOutcome: (outcome: ReviewOutcome) => void;
}

export function Flashcard({ item, direction, onOutcome }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);
  const front = direction === 'en-ru' ? item.english : item.translation;

  function handleOutcome(outcome: ReviewOutcome) {
    onOutcome(outcome);
    setRevealed(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm">
      <p className="text-2xl font-bold">{front}</p>
      {direction === 'en-ru' && <ListenButton text={item.english} />}
      {!revealed && (
        <button className="text-sm text-gray-500 underline" onClick={() => setRevealed(true)}>
          Tap to reveal
        </button>
      )}
      {revealed && (
        <div className="flex flex-col items-center gap-1">
          {direction === 'en-ru' ? (
            <>
              {item.ipa && <p className="text-gray-500">{item.ipa}</p>}
              <p className="text-lg">{item.translation}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">{item.english}</p>
              {item.ipa && <p className="text-gray-500">{item.ipa}</p>}
            </>
          )}
          {item.example && <p className="text-sm italic text-gray-500">{item.example}</p>}
        </div>
      )}
      {revealed && (
        <div className="flex gap-2">
          <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700" onClick={() => handleOutcome('again')}>❌ Don't know</button>
          <button className="rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-700" onClick={() => handleOutcome('hard')}>🤔 Hard</button>
          <button className="rounded bg-green-100 px-3 py-1 text-sm text-green-700" onClick={() => handleOutcome('know')}>✅ Know</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write the failing test for `FlashcardDeck`**

```tsx
// components/flashcards/FlashcardDeck.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardDeck } from './FlashcardDeck';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('FlashcardDeck', () => {
  it('advances to the next card and updates the item after an outcome', () => {
    const onUpdateItem = vi.fn();
    render(<FlashcardDeck items={items} onUpdateItem={onUpdateItem} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: /know/i }));
    expect(onUpdateItem).toHaveBeenCalledTimes(1);
    expect(onUpdateItem.mock.calls[0][0].id).toBe('1');
    expect(screen.getByText('chair')).toBeInTheDocument();
  });

  it('toggles direction between EN->RU and RU->EN', () => {
    render(<FlashcardDeck items={items} onUpdateItem={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ru.*en/i }));
    expect(screen.getByText('мама')).toBeInTheDocument();
  });

  it('shows a completion message once every card is done', () => {
    render(<FlashcardDeck items={[items[0]]} onUpdateItem={vi.fn()} />);
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: /know/i }));
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test, verify it fails**

Run: `npm run test -- components/flashcards/FlashcardDeck.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 6: Implement `components/flashcards/FlashcardDeck.tsx`**

```tsx
// components/flashcards/FlashcardDeck.tsx
'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { updateReviewState } from '@/lib/learning/review';
import { Flashcard } from './Flashcard';
import { cn } from '@/lib/utils';

interface FlashcardDeckProps {
  items: VocabItem[];
  onUpdateItem: (item: VocabItem) => void;
}

export function FlashcardDeck({ items, onUpdateItem }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'en-ru' | 'ru-en'>('en-ru');

  if (items.length === 0) return <p className="text-sm text-gray-500">No cards to study yet.</p>;
  if (index >= items.length) return <p className="text-lg font-medium">Done for now! 🎉</p>;

  const current = items[index];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'en-ru' && 'bg-blue-600 text-white')}
          onClick={() => setDirection('en-ru')}
        >
          🇬🇧 → 🇷🇺
        </button>
        <button
          className={cn('rounded-full border px-3 py-1 text-xs', direction === 'ru-en' && 'bg-blue-600 text-white')}
          onClick={() => setDirection('ru-en')}
        >
          🇷🇺 → 🇬🇧
        </button>
      </div>
      <Flashcard
        item={current}
        direction={direction}
        onOutcome={(outcome) => {
          onUpdateItem({ ...current, review: updateReviewState(current.review, outcome) });
          setIndex((i) => i + 1);
        }}
      />
      <p className="text-xs text-gray-400">{index + 1} / {items.length}</p>
    </div>
  );
}
```

- [ ] **Step 7: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add components/flashcards
git commit -m "feat: add flashcard and flashcard deck components"
```

---

### Task 15: Typing Practice

**Files:**
- Create: `lib/learning/typingCheck.ts`, `components/exercises/TypingPractice.tsx`
- Test: `lib/learning/typingCheck.test.ts`, `components/exercises/TypingPractice.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2; `isAnswerCorrect` from Task 5.
- Produces: `diffTyped(userInput: string, correct: string): { char: string; correct: boolean }[]`; `<TypingPractice items={VocabItem[]} />` (auto-picks a random word, shows translation, checks typed English). Used by Task 17.

- [ ] **Step 1: Write the failing test for `diffTyped`**

```ts
// lib/learning/typingCheck.test.ts
import { describe, it, expect } from 'vitest';
import { diffTyped } from './typingCheck';

describe('diffTyped', () => {
  it('marks each character correct or incorrect against the target word', () => {
    expect(diffTyped('mother', 'mother')).toEqual([
      { char: 'm', correct: true }, { char: 'o', correct: true }, { char: 't', correct: true },
      { char: 'h', correct: true }, { char: 'e', correct: true }, { char: 'r', correct: true },
    ]);
  });

  it('flags mismatched characters', () => {
    expect(diffTyped('mothar', 'mother')).toEqual([
      { char: 'm', correct: true }, { char: 'o', correct: true }, { char: 't', correct: true },
      { char: 'h', correct: true }, { char: 'a', correct: false }, { char: 'r', correct: true },
    ]);
  });

  it('is case-insensitive', () => {
    expect(diffTyped('MOTHER', 'mother').every((c) => c.correct)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/typingCheck.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/typingCheck.ts`**

```ts
// lib/learning/typingCheck.ts
export interface CharDiff { char: string; correct: boolean }

export function diffTyped(userInput: string, correct: string): CharDiff[] {
  const typed = userInput.trim().toLowerCase();
  const target = correct.trim().toLowerCase();
  return typed.split('').map((char, i) => ({ char, correct: char === target[i] }));
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/typingCheck.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `TypingPractice`**

```tsx
// components/exercises/TypingPractice.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TypingPractice } from './TypingPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('TypingPractice', () => {
  it('shows the translation and checks a correct typed answer', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    expect(screen.getByText('мама')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'mother' } });
    fireEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it('shows the correct word after an incorrect attempt', () => {
    render(<TypingPractice items={items} random={() => 0} />);
    fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'mothar' } });
    fireEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    expect(screen.getByText('mother')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/exercises/TypingPractice.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/exercises/TypingPractice.tsx`**

```tsx
// components/exercises/TypingPractice.tsx
'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { isAnswerCorrect } from '@/lib/learning/checkAnswer';
import { diffTyped } from '@/lib/learning/typingCheck';

interface TypingPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

export function TypingPractice({ items, random = Math.random }: TypingPracticeProps) {
  const target = useMemo(() => items[Math.floor(random() * items.length)], [items, random]);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  if (!target) return <p className="text-sm text-gray-500">Add some words first.</p>;

  const correct = isAnswerCorrect(input, [target.english]);
  const diff = diffTyped(input, target.english);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold">{target.translation}</p>
      <label className="flex flex-col gap-1 text-sm">
        Your answer
        <input
          className="rounded border px-2 py-1 text-center"
          value={input}
          onChange={(e) => { setInput(e.target.value); setChecked(false); }}
        />
      </label>
      {checked && (
        <p className="flex gap-0.5 font-mono text-lg">
          {diff.map((d, i) => <span key={i} className={d.correct ? 'text-green-600' : 'text-red-600'}>{d.char}</span>)}
        </p>
      )}
      <button className="rounded bg-blue-600 px-4 py-1 text-sm text-white" onClick={() => setChecked(true)}>Check</button>
      {checked && (correct ? <p className="text-green-600">✅ Correct!</p> : <p className="text-red-600">❌ Incorrect — correct answer: <strong>{target.english}</strong></p>)}
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/learning/typingCheck.ts lib/learning/typingCheck.test.ts components/exercises/TypingPractice.tsx components/exercises/TypingPractice.test.tsx
git commit -m "feat: add typing practice mode"
```

---

### Task 16: Listening Practice

**Files:**
- Create: `lib/learning/listeningPractice.ts`, `components/exercises/ListeningPractice.tsx`
- Test: `lib/learning/listeningPractice.test.ts`, `components/exercises/ListeningPractice.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2; `ListenButton` from Task 10.
- Produces: `buildListeningRound<T>(pool: T[], random?: () => number): { target: T; options: T[] } | null`; `<ListeningPractice items={VocabItem[]} />`. Used by Task 17.

- [ ] **Step 1: Write the failing test for `buildListeningRound`**

```ts
// lib/learning/listeningPractice.test.ts
import { describe, it, expect } from 'vitest';
import { buildListeningRound } from './listeningPractice';

interface Item { id: string; english: string; category: string; }

const pool: Item[] = [
  { id: '1', english: 'mother', category: 'Family' },
  { id: '2', english: 'father', category: 'Family' },
  { id: '3', english: 'chair', category: 'Home' },
  { id: '4', english: 'table', category: 'Home' },
];

describe('buildListeningRound', () => {
  it('returns null for an empty pool', () => {
    expect(buildListeningRound([], () => 0)).toBeNull();
  });

  it('returns a target and up to 3 unique options including the target', () => {
    const round = buildListeningRound(pool, () => 0);
    expect(round).not.toBeNull();
    expect(round!.options).toHaveLength(3);
    expect(round!.options.map((o) => o.id)).toContain(round!.target.id);
    const uniqueIds = new Set(round!.options.map((o) => o.id));
    expect(uniqueIds.size).toBe(3);
  });

  it('prefers same-category distractors when available', () => {
    const round = buildListeningRound(pool, () => 0);
    const distractorCategories = round!.options.filter((o) => o.id !== round!.target.id).map((o) => o.category);
    expect(distractorCategories).toContain(round!.target.category);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/listeningPractice.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/listeningPractice.ts`**

```ts
// lib/learning/listeningPractice.ts
function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildListeningRound<T extends { id: string; english: string; category: string }>(
  pool: T[],
  random: () => number = Math.random
): { target: T; options: T[] } | null {
  if (pool.length === 0) return null;
  const shuffledPool = shuffled(pool, random);
  const target = shuffledPool[0];
  const rest = shuffledPool.slice(1);
  const sameCategory = rest.filter((w) => w.category === target.category);
  const otherCategory = rest.filter((w) => w.category !== target.category);
  const distractors = [...sameCategory, ...otherCategory].slice(0, 2);
  const options = shuffled([target, ...distractors], random);
  return { target, options };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/listeningPractice.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `ListeningPractice`**

```tsx
// components/exercises/ListeningPractice.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListeningPractice } from './ListeningPractice';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'father', translation: 'папа', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('ListeningPractice', () => {
  beforeEach(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
    // @ts-expect-error test stub
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({ text, lang: '' }));
  });

  it('renders 3 option buttons and marks the correct choice', () => {
    render(<ListeningPractice items={items} random={() => 0} />);
    const buttons = screen.getAllByRole('button', { name: /^(mother|father|chair|table)$/i });
    expect(buttons).toHaveLength(3);
    fireEvent.click(buttons.find((b) => b.textContent === items[0].english)!);
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/exercises/ListeningPractice.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/exercises/ListeningPractice.tsx`**

```tsx
// components/exercises/ListeningPractice.tsx
'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { buildListeningRound } from '@/lib/learning/listeningPractice';
import { ListenButton } from '@/components/shared/ListenButton';
import { cn } from '@/lib/utils';

interface ListeningPracticeProps {
  items: VocabItem[];
  random?: () => number;
}

export function ListeningPractice({ items, random = Math.random }: ListeningPracticeProps) {
  const round = useMemo(() => buildListeningRound(items, random), [items, random]);
  const [selected, setSelected] = useState<string | null>(null);

  if (!round) return <p className="text-sm text-gray-500">Add some words first.</p>;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ListenButton text={round.target.english} className="scale-150" />
      <div className="flex gap-2">
        {round.options.map((opt) => (
          <button
            key={opt.id}
            className={cn(
              'rounded border px-3 py-2 text-sm',
              selected && opt.id === round.target.id && 'border-green-500 bg-green-50',
              selected === opt.id && opt.id !== round.target.id && 'border-red-500 bg-red-50'
            )}
            onClick={() => setSelected(opt.id)}
          >
            {opt.english}
          </button>
        ))}
      </div>
      {selected && (selected === round.target.id ? <p className="text-green-600">✅ Correct!</p> : <p className="text-red-600">❌ Incorrect</p>)}
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/learning/listeningPractice.ts lib/learning/listeningPractice.test.ts components/exercises/ListeningPractice.tsx components/exercises/ListeningPractice.test.tsx
git commit -m "feat: add listening practice mode"
```

---

### Task 17: VocabSection assembly + Vocabulary/Phrases pages

**Files:**
- Create: `components/vocabulary/VocabSection.tsx`
- Modify: `app/vocabulary/page.tsx` (create), `app/phrases/page.tsx` (create)
- Test: `components/vocabulary/VocabSection.test.tsx`

**Interfaces:**
- Consumes: `VocabTable` (Task 13), `FlashcardDeck` (Task 14), `TypingPractice` (Task 15), `ListeningPractice` (Task 16), `VocabForm` (Task 11); any `CollectionState<VocabItem>` Zustand hook from Task 6.
- Produces: `<VocabSection store={() => CollectionState<VocabItem>} title={string} kind={'word'|'phrase'} />` with a mode switcher (Table / Flashcards / Typing / Listening) and add/edit/delete wiring. Used by `/vocabulary` and `/phrases` pages.

- [ ] **Step 1: Write the failing test**

```tsx
// components/vocabulary/VocabSection.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabSection } from './VocabSection';
import { useWordsStore } from '@/lib/storage/wordsStore';

describe('VocabSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({
      items: [{
        id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
        review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
  });

  it('shows the table view by default', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    expect(screen.getByText('mother')).toBeInTheDocument();
  });

  it('switches to Flashcards mode', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    fireEvent.click(screen.getByRole('button', { name: /flashcards/i }));
    expect(screen.getByText(/tap to reveal/i)).toBeInTheDocument();
  });

  it('opens the add form and adds a new word to the store', () => {
    render(<VocabSection store={useWordsStore} title="My Vocabulary" kind="word" />);
    fireEvent.click(screen.getByRole('button', { name: /\+ add/i }));
    fireEvent.change(screen.getByLabelText(/english/i), { target: { value: 'dog' } });
    fireEvent.change(screen.getByLabelText(/translation/i), { target: { value: 'собака' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(useWordsStore.getState().items).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/vocabulary/VocabSection.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/vocabulary/VocabSection.tsx`**

```tsx
// components/vocabulary/VocabSection.tsx
'use client';

import { useState } from 'react';
import { VocabItem } from '@/types/models';
import { CollectionState } from '@/lib/storage/createCollectionStore';
import { VocabTable } from './VocabTable';
import { VocabForm } from './VocabForm';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { TypingPractice } from '@/components/exercises/TypingPractice';
import { ListeningPractice } from '@/components/exercises/ListeningPractice';
import { cn } from '@/lib/utils';

type Mode = 'table' | 'flashcards' | 'typing' | 'listening';

interface VocabSectionProps {
  store: () => CollectionState<VocabItem>;
  title: string;
  kind: 'word' | 'phrase';
}

export function VocabSection({ store, title }: VocabSectionProps) {
  const items = store((s) => s.items);
  const add = store((s) => s.add);
  const update = store((s) => s.update);
  const remove = store((s) => s.remove);

  const [mode, setMode] = useState<Mode>('table');
  const [editing, setEditing] = useState<VocabItem | 'new' | null>(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{title}</h1>
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => setEditing('new')}>+ Add</button>
      </div>

      <div className="mb-4 flex gap-2">
        {(['table', 'flashcards', 'typing', 'listening'] as Mode[]).map((m) => (
          <button
            key={m}
            className={cn('rounded-full border px-3 py-1 text-sm capitalize', mode === m && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {editing && (
        <div className="mb-4 rounded-lg border p-4">
          <VocabForm
            initial={editing === 'new' ? undefined : editing}
            onSubmit={(item) => {
              if (editing === 'new') add(item);
              else update(item);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {mode === 'table' && <VocabTable items={items} onEdit={setEditing} onDelete={remove} />}
      {mode === 'flashcards' && <FlashcardDeck items={items} onUpdateItem={update} />}
      {mode === 'typing' && <TypingPractice items={items} />}
      {mode === 'listening' && <ListeningPractice items={items} />}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Implement `app/vocabulary/page.tsx` and `app/phrases/page.tsx`**

```tsx
// app/vocabulary/page.tsx
'use client';
import { VocabSection } from '@/components/vocabulary/VocabSection';
import { useWordsStore } from '@/lib/storage/wordsStore';

export default function VocabularyPage() {
  return <VocabSection store={useWordsStore} title="📚 My Vocabulary" kind="word" />;
}
```

```tsx
// app/phrases/page.tsx
'use client';
import { VocabSection } from '@/components/vocabulary/VocabSection';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';

export default function PhrasesPage() {
  return <VocabSection store={usePhrasesStore} title="💬 My Phrases" kind="phrase" />;
}
```

- [ ] **Step 6: Run `npm run build` to confirm both routes compile**

Run: `npm run build`
Expected: build succeeds, `/vocabulary` and `/phrases` routes listed.

- [ ] **Step 7: Commit**

```bash
git add components/vocabulary/VocabSection.tsx components/vocabulary/VocabSection.test.tsx app/vocabulary/page.tsx app/phrases/page.tsx
git commit -m "feat: assemble Vocabulary and Phrases pages with all study modes"
```

---

## Phase C — Grammar & Exercises

### Task 18: Exercise runner (fill-blank, multiple-choice, scoring)

**Files:**
- Create: `lib/learning/exerciseProgress.ts`, `components/exercises/FillBlankExercise.tsx`, `components/exercises/MultipleChoiceExercise.tsx`, `components/exercises/ExerciseRunner.tsx`
- Test: `lib/learning/exerciseProgress.test.ts`, `components/exercises/FillBlankExercise.test.tsx`, `components/exercises/MultipleChoiceExercise.test.tsx`, `components/exercises/ExerciseRunner.test.tsx`

**Interfaces:**
- Consumes: `FillBlankItem`, `MultipleChoiceItem`, `Exercise` from Task 2; `isFillBlankItemCorrect`, `isMultipleChoiceItemCorrect` from Task 5.
- Produces: `initFillBlankAnswers(items): string[][]`, `initMultipleChoiceAnswers(items): (number|null)[]`, `scoreFillBlank(items, answers): {correct,total}`, `scoreMultipleChoice(items, answers): {correct,total}`; `<FillBlankExercise items userAnswers checked onAnswerChange onCheck />`; `<MultipleChoiceExercise items selected checked onSelect onCheck />`; `<ExerciseRunner exercise onComplete?={(score)=>void} />` (self-contained: owns answer state, wires Check/Show-correct-answer, calls `onComplete` once every item is checked). Used by Tasks 19, 20, 22.

- [ ] **Step 1: Write the failing test for `exerciseProgress`**

```ts
// lib/learning/exerciseProgress.test.ts
import { describe, it, expect } from 'vitest';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from './exerciseProgress';

describe('initFillBlankAnswers', () => {
  it('creates an empty-string slot per blank per item', () => {
    const items = [{ text: 'a ___ b ___ c', blanks: [['x'], ['y']] }, { text: 'd ___ e', blanks: [['z']] }];
    expect(initFillBlankAnswers(items)).toEqual([['', ''], ['']]);
  });
});

describe('initMultipleChoiceAnswers', () => {
  it('creates a null slot per item', () => {
    const items = [{ question: 'q1', options: ['a', 'b'], correctIndex: 0 }, { question: 'q2', options: ['a', 'b'], correctIndex: 1 }];
    expect(initMultipleChoiceAnswers(items)).toEqual([null, null]);
  });
});

describe('scoreFillBlank', () => {
  it('counts items where every blank matches', () => {
    const items = [{ text: 'she ___ 22', blanks: [['was']] }, { text: 'they ___ here', blanks: [['were']] }];
    expect(scoreFillBlank(items, [['was'], ['are']])).toEqual({ correct: 1, total: 2 });
  });
});

describe('scoreMultipleChoice', () => {
  it('counts items where the selected index matches correctIndex', () => {
    const items = [{ question: 'q1', options: ['a', 'b'], correctIndex: 0 }, { question: 'q2', options: ['a', 'b'], correctIndex: 1 }];
    expect(scoreMultipleChoice(items, [0, 0])).toEqual({ correct: 1, total: 2 });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/exerciseProgress.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/exerciseProgress.ts`**

```ts
// lib/learning/exerciseProgress.ts
import { FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from './checkAnswer';

export function initFillBlankAnswers(items: FillBlankItem[]): string[][] {
  return items.map((item) => item.blanks.map(() => ''));
}

export function initMultipleChoiceAnswers(items: MultipleChoiceItem[]): (number | null)[] {
  return items.map(() => null);
}

export function scoreFillBlank(items: FillBlankItem[], answers: string[][]): { correct: number; total: number } {
  const total = items.length;
  const correct = items.filter((item, i) => isFillBlankItemCorrect(item, answers[i] ?? [])).length;
  return { correct, total };
}

export function scoreMultipleChoice(items: MultipleChoiceItem[], answers: (number | null)[]): { correct: number; total: number } {
  const total = items.length;
  const correct = items.filter((item, i) => isMultipleChoiceItemCorrect(item, answers[i] ?? null)).length;
  return { correct, total };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/exerciseProgress.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `FillBlankExercise`**

```tsx
// components/exercises/FillBlankExercise.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FillBlankExercise } from './FillBlankExercise';

const items = [{ text: 'She ___ 22 last year.', blanks: [['was']] }];

describe('FillBlankExercise', () => {
  it('reports typed values via onAnswerChange', () => {
    const onAnswerChange = vi.fn();
    render(<FillBlankExercise items={items} userAnswers={[['']]} checked={[false]} onAnswerChange={onAnswerChange} onCheck={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    expect(onAnswerChange).toHaveBeenCalledWith(0, 0, 'was');
  });

  it('colors the blank green when checked and correct', () => {
    render(<FillBlankExercise items={items} userAnswers={[['was']]} checked={[true]} onAnswerChange={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByLabelText('blank-0-0')).toHaveClass('border-green-500');
  });

  it('colors the blank red when checked and incorrect', () => {
    render(<FillBlankExercise items={items} userAnswers={[['were']]} checked={[true]} onAnswerChange={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByLabelText('blank-0-0')).toHaveClass('border-red-500');
  });

  it('calls onCheck with the item index', () => {
    const onCheck = vi.fn();
    render(<FillBlankExercise items={items} userAnswers={[['was']]} checked={[false]} onAnswerChange={vi.fn()} onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onCheck).toHaveBeenCalledWith(0);
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/exercises/FillBlankExercise.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/exercises/FillBlankExercise.tsx`**

```tsx
// components/exercises/FillBlankExercise.tsx
'use client';

import { FillBlankItem } from '@/types/models';
import { isAnswerCorrect } from '@/lib/learning/checkAnswer';
import { cn } from '@/lib/utils';

interface FillBlankExerciseProps {
  items: FillBlankItem[];
  userAnswers: string[][];
  checked: boolean[];
  onAnswerChange: (itemIndex: number, blankIndex: number, value: string) => void;
  onCheck: (itemIndex: number) => void;
}

export function FillBlankExercise({ items, userAnswers, checked, onAnswerChange, onCheck }: FillBlankExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const parts = item.text.split('___');
        const isChecked = checked[i];
        return (
          <div key={i} className="rounded-lg border p-3">
            <p className="flex flex-wrap items-center gap-1">
              {parts.map((part, pi) => (
                <span key={pi} className="flex items-center gap-1">
                  <span>{part}</span>
                  {pi < parts.length - 1 && (
                    <input
                      aria-label={`blank-${i}-${pi}`}
                      className={cn(
                        'w-24 border-b bg-transparent px-1 outline-none',
                        isChecked
                          ? isAnswerCorrect(userAnswers[i]?.[pi] ?? '', item.blanks[pi])
                            ? 'border-green-500 text-green-600'
                            : 'border-red-500 text-red-600'
                          : 'border-gray-400'
                      )}
                      value={userAnswers[i]?.[pi] ?? ''}
                      onChange={(e) => onAnswerChange(i, pi, e.target.value)}
                    />
                  )}
                </span>
              ))}
            </p>
            <button type="button" className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => onCheck(i)}>
              CHECK ANSWER
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8: Write the failing test for `MultipleChoiceExercise`**

```tsx
// components/exercises/MultipleChoiceExercise.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';

const items = [{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 }];

describe('MultipleChoiceExercise', () => {
  it('reports the selected option via onSelect', () => {
    const onSelect = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[null]} checked={[false]} onSelect={onSelect} onCheck={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'is' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });

  it('highlights the selected correct option green once checked', () => {
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[true]} onSelect={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'is' })).toHaveClass('bg-green-50');
  });

  it('highlights a wrong selection red once checked', () => {
    render(<MultipleChoiceExercise items={items} selected={[0]} checked={[true]} onSelect={vi.fn()} onCheck={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'am' })).toHaveClass('bg-red-50');
  });

  it('calls onCheck with the item index', () => {
    const onCheck = vi.fn();
    render(<MultipleChoiceExercise items={items} selected={[1]} checked={[false]} onSelect={vi.fn()} onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onCheck).toHaveBeenCalledWith(0);
  });
});
```

- [ ] **Step 9: Run test, verify it fails**

Run: `npm run test -- components/exercises/MultipleChoiceExercise.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 10: Implement `components/exercises/MultipleChoiceExercise.tsx`**

```tsx
// components/exercises/MultipleChoiceExercise.tsx
'use client';

import { MultipleChoiceItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface MultipleChoiceExerciseProps {
  items: MultipleChoiceItem[];
  selected: (number | null)[];
  checked: boolean[];
  onSelect: (itemIndex: number, optionIndex: number) => void;
  onCheck: (itemIndex: number) => void;
}

export function MultipleChoiceExercise({ items, selected, checked, onSelect, onCheck }: MultipleChoiceExerciseProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border p-3">
          <p className="mb-2 font-medium">{item.question}</p>
          <div className="flex flex-wrap gap-2">
            {item.options.map((opt, oi) => {
              const isSelected = selected[i] === oi;
              const isChecked = checked[i];
              const isCorrectOption = oi === item.correctIndex;
              return (
                <button
                  key={oi}
                  type="button"
                  className={cn(
                    'rounded border px-3 py-1 text-sm',
                    isChecked && isSelected && (isCorrectOption ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'),
                    !isChecked && isSelected && 'border-blue-500 bg-blue-50'
                  )}
                  onClick={() => onSelect(i, oi)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button type="button" className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => onCheck(i)}>
            CHECK ANSWER
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 11: Write the failing test for `ExerciseRunner`**

```tsx
// components/exercises/ExerciseRunner.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseRunner } from './ExerciseRunner';

const fillBlankExercise = {
  id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill in was/were.',
  items: [{ text: 'She ___ 22 last year.', blanks: [['was']] }],
};

describe('ExerciseRunner', () => {
  it('shows the instruction and the answer inputs', () => {
    render(<ExerciseRunner exercise={fillBlankExercise} />);
    expect(screen.getByText('Fill in was/were.')).toBeInTheDocument();
    expect(screen.getByLabelText('blank-0-0')).toBeInTheDocument();
  });

  it('calls onComplete with the final score once every item is checked', () => {
    const onComplete = vi.fn();
    render(<ExerciseRunner exercise={fillBlankExercise} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
  });

  it('reveals the correct answer on demand', () => {
    render(<ExerciseRunner exercise={fillBlankExercise} />);
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /show correct answer/i }));
    expect(screen.getByText(/correct answer:/i)).toBeInTheDocument();
    expect(screen.getByText('was')).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Run test, verify it fails**

Run: `npm run test -- components/exercises/ExerciseRunner.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 13: Implement `components/exercises/ExerciseRunner.tsx`**

```tsx
// components/exercises/ExerciseRunner.tsx
'use client';

import { useState } from 'react';
import { Exercise, FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from '@/lib/learning/exerciseProgress';
import { FillBlankExercise } from './FillBlankExercise';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';

interface ExerciseRunnerProps {
  exercise: Exercise;
  onComplete?: (score: { correct: number; total: number }) => void;
}

export function ExerciseRunner({ exercise, onComplete }: ExerciseRunnerProps) {
  const isFillBlank = exercise.type === 'fill-blank';
  const fillItems = isFillBlank ? (exercise.items as FillBlankItem[]) : [];
  const mcItems = !isFillBlank ? (exercise.items as MultipleChoiceItem[]) : [];
  const itemCount = exercise.items.length;

  const [fillAnswers, setFillAnswers] = useState<string[][]>(() => initFillBlankAnswers(fillItems));
  const [mcAnswers, setMcAnswers] = useState<(number | null)[]>(() => initMultipleChoiceAnswers(mcItems));
  const [checked, setChecked] = useState<boolean[]>(() => exercise.items.map(() => false));
  const [showCorrect, setShowCorrect] = useState<boolean[]>(() => exercise.items.map(() => false));

  function handleCheck(i: number) {
    const nextChecked = checked.map((v, idx) => (idx === i ? true : v));
    setChecked(nextChecked);
    if (nextChecked.every(Boolean) && onComplete) {
      const score = isFillBlank ? scoreFillBlank(fillItems, fillAnswers) : scoreMultipleChoice(mcItems, mcAnswers);
      onComplete(score);
    }
  }

  function toggleShowCorrect(i: number) {
    setShowCorrect((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div>
      <p className="mb-3 font-medium">{exercise.instruction}</p>
      {isFillBlank ? (
        <FillBlankExercise
          items={fillItems}
          userAnswers={fillAnswers}
          checked={checked}
          onAnswerChange={(i, bi, value) => setFillAnswers((prev) => prev.map((a, idx) => (idx === i ? a.map((b, bidx) => (bidx === bi ? value : b)) : a)))}
          onCheck={handleCheck}
        />
      ) : (
        <MultipleChoiceExercise
          items={mcItems}
          selected={mcAnswers}
          checked={checked}
          onSelect={(i, oi) => setMcAnswers((prev) => prev.map((v, idx) => (idx === i ? oi : v)))}
          onCheck={handleCheck}
        />
      )}
      <div className="mt-2 flex flex-col gap-2">
        {Array.from({ length: itemCount }).map((_, i) => checked[i] && (
          <div key={i} className="flex flex-col gap-1 text-xs text-gray-500">
            <button type="button" className="w-fit underline" onClick={() => toggleShowCorrect(i)}>
              👁 Show correct answer
            </button>
            {showCorrect[i] && (
              <p>
                Correct answer: <strong>
                  {isFillBlank ? fillItems[i].blanks.map((b) => b[0]).join(', ') : mcItems[i].options[mcItems[i].correctIndex]}
                </strong>
              </p>
            )}
          </div>
        ))}
      </div>
      {exercise.explanation && checked.some(Boolean) && <p className="mt-2 text-sm text-gray-500">{exercise.explanation}</p>}
    </div>
  );
}
```

- [ ] **Step 14: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add lib/learning/exerciseProgress.ts lib/learning/exerciseProgress.test.ts components/exercises/FillBlankExercise.tsx components/exercises/FillBlankExercise.test.tsx components/exercises/MultipleChoiceExercise.tsx components/exercises/MultipleChoiceExercise.test.tsx components/exercises/ExerciseRunner.tsx components/exercises/ExerciseRunner.test.tsx
git commit -m "feat: add fill-blank/multiple-choice exercise runner with scoring"
```

---

### Task 19: Grammar page

**Files:**
- Create: `components/grammar/GrammarTopicCard.tsx`, `components/grammar/GrammarTopicForm.tsx`, `app/grammar/page.tsx`
- Modify: `app/add/page.tsx`
- Test: `components/grammar/GrammarTopicCard.test.tsx`, `components/grammar/GrammarTopicForm.test.tsx`

**Interfaces:**
- Consumes: `GrammarTopic` from Task 2; `ExerciseRunner` from Task 18; `useGrammarStore` from Task 6; `generateId` from Task 1.
- Produces: `<GrammarTopicCard topic={GrammarTopic} />`, `<GrammarTopicForm onSubmit={(topic: GrammarTopic) => void} />`, `/grammar` route. Used by nothing downstream except the Add New wiring in this same task.

- [ ] **Step 1: Write the failing test for `GrammarTopicCard`**

```tsx
// components/grammar/GrammarTopicCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrammarTopicCard } from './GrammarTopicCard';

const topic = {
  id: 'g1', title: 'There is / There are', explanation: 'There is — единственное число.',
  examples: ['There is a chair in the room.'],
  practiceExercises: [{ id: 'ex1', type: 'multiple-choice' as const, instruction: 'Choose the right option.', items: [{ question: '___ a sofa.', options: ['There is', 'There are'], correctIndex: 0 }] }],
  dateAdded: '2026-09-24',
};

describe('GrammarTopicCard', () => {
  it('renders title, explanation, examples and embedded practice', () => {
    render(<GrammarTopicCard topic={topic} />);
    expect(screen.getByText('There is / There are')).toBeInTheDocument();
    expect(screen.getByText('There is — единственное число.')).toBeInTheDocument();
    expect(screen.getByText('There is a chair in the room.')).toBeInTheDocument();
    expect(screen.getByText('Choose the right option.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/grammar/GrammarTopicCard.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/grammar/GrammarTopicCard.tsx`**

```tsx
// components/grammar/GrammarTopicCard.tsx
import { GrammarTopic } from '@/types/models';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';

interface GrammarTopicCardProps {
  topic: GrammarTopic;
}

export function GrammarTopicCard({ topic }: GrammarTopicCardProps) {
  return (
    <div className="mb-4 rounded-xl border p-4">
      <h2 className="text-lg font-bold">{topic.title}</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{topic.explanation}</p>
      <ul className="mt-2 list-inside list-disc text-sm">
        {topic.examples.map((ex, i) => <li key={i}>{ex}</li>)}
      </ul>
      {topic.practiceExercises.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="mb-2 text-sm font-semibold">Practice</h3>
          {topic.practiceExercises.map((ex) => <ExerciseRunner key={ex.id} exercise={ex} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write the failing test for `GrammarTopicForm`**

```tsx
// components/grammar/GrammarTopicForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GrammarTopicForm } from './GrammarTopicForm';

describe('GrammarTopicForm', () => {
  it('requires title and explanation', () => {
    const onSubmit = vi.fn();
    render(<GrammarTopicForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a topic with examples split by line', () => {
    const onSubmit = vi.fn();
    render(<GrammarTopicForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: 'Present Simple' } });
    fireEvent.change(screen.getByLabelText(/explanation/i), { target: { value: 'Used for habits.' } });
    fireEvent.change(screen.getByLabelText(/examples/i), { target: { value: 'I work every day.\nShe works every day.' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.title).toBe('Present Simple');
    expect(submitted.examples).toEqual(['I work every day.', 'She works every day.']);
    expect(submitted.practiceExercises).toEqual([]);
  });
});
```

- [ ] **Step 5: Run test, verify it fails**

Run: `npm run test -- components/grammar/GrammarTopicForm.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 6: Implement `components/grammar/GrammarTopicForm.tsx`**

```tsx
// components/grammar/GrammarTopicForm.tsx
'use client';

import { useState } from 'react';
import { GrammarTopic } from '@/types/models';
import { generateId } from '@/lib/utils';

interface GrammarTopicFormProps {
  onSubmit: (topic: GrammarTopic) => void;
}

export function GrammarTopicForm({ onSubmit }: GrammarTopicFormProps) {
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [examplesText, setExamplesText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !explanation.trim()) {
      setError('Title and explanation are required.');
      return;
    }
    setError(null);
    onSubmit({
      id: generateId(),
      title: title.trim(),
      explanation: explanation.trim(),
      examples: examplesText.split('\n').map((l) => l.trim()).filter(Boolean),
      practiceExercises: [],
      dateAdded: new Date().toISOString().slice(0, 10),
    });
    setTitle('');
    setExplanation('');
    setExamplesText('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Topic
        <input className="rounded border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Explanation
        <textarea className="rounded border px-2 py-1" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Examples (one per line)
        <textarea className="rounded border px-2 py-1" value={examplesText} onChange={(e) => setExamplesText(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
    </form>
  );
}
```

- [ ] **Step 7: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Implement `app/grammar/page.tsx`**

```tsx
// app/grammar/page.tsx
'use client';

import { useGrammarStore } from '@/lib/storage/grammarStore';
import { GrammarTopicCard } from '@/components/grammar/GrammarTopicCard';

export default function GrammarPage() {
  const topics = useGrammarStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">📖 Grammar</h1>
      {topics.length === 0 && <p className="text-sm text-gray-500">No grammar topics yet — add one from + Add New.</p>}
      {topics.map((t) => <GrammarTopicCard key={t.id} topic={t} />)}
    </div>
  );
}
```

- [ ] **Step 9: Wire Grammar into `app/add/page.tsx`**

Replace the `type === 'Grammar'` placeholder branch from Task 12:

```tsx
// app/add/page.tsx — add this import
import { GrammarTopicForm } from '@/components/grammar/GrammarTopicForm';
import { useGrammarStore } from '@/lib/storage/grammarStore';
```

```tsx
// app/add/page.tsx — inside AddPage(), add alongside addWord/addPhrase
const addGrammarTopic = useGrammarStore((s) => s.add);
```

```tsx
// app/add/page.tsx — replace the Grammar placeholder branch
{type === 'Grammar' && (
  <GrammarTopicForm
    onSubmit={(topic) => {
      addGrammarTopic(topic);
      setSavedMessage('Grammar topic saved.');
    }}
  />
)}
```

- [ ] **Step 10: Run `npm run build` to confirm `/grammar` and updated `/add` compile**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add components/grammar app/grammar/page.tsx app/add/page.tsx
git commit -m "feat: add Grammar page and topic authoring"
```

---

### Task 20: Exercises page (author + list + attempt)

**Files:**
- Create: `components/exercises/ExerciseForm.tsx`, `app/exercises/page.tsx`, `app/exercises/[id]/page.tsx`
- Modify: `app/add/page.tsx`
- Test: `components/exercises/ExerciseForm.test.tsx`, `app/exercises/page.test.tsx`

**Interfaces:**
- Consumes: `Exercise`, `FillBlankItem`, `MultipleChoiceItem` from Task 2; `generateId` from Task 1; `ExerciseRunner` from Task 18; `useExercisesStore` from Task 6.
- Produces: `<ExerciseForm onSubmit={(exercise: Exercise) => void} />`; `/exercises` list route; `/exercises/[id]` attempt route.

- [ ] **Step 1: Write the failing test for `ExerciseForm`**

```tsx
// components/exercises/ExerciseForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseForm } from './ExerciseForm';

describe('ExerciseForm', () => {
  it('submits a fill-blank exercise with one accepted-answers blank', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Fill the gap.' } });
    fireEvent.change(screen.getByLabelText(/sentence/i), { target: { value: 'The book is ___ the table.' } });
    fireEvent.change(screen.getByLabelText(/accepted answers/i), { target: { value: 'on, on top of' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const ex = onSubmit.mock.calls[0][0];
    expect(ex.type).toBe('fill-blank');
    expect(ex.items).toEqual([{ text: 'The book is ___ the table.', blanks: [['on', 'on top of']] }]);
  });

  it('submits a multiple-choice exercise', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /multiple choice/i }));
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Choose the right form.' } });
    fireEvent.change(screen.getByLabelText(/^question/i), { target: { value: 'She ___ from Kyrgyzstan.' } });
    fireEvent.change(screen.getByLabelText(/options/i), { target: { value: 'am, is, are' } });
    fireEvent.change(screen.getByLabelText(/correct option index/i), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    const ex = onSubmit.mock.calls[0][0];
    expect(ex.type).toBe('multiple-choice');
    expect(ex.items).toEqual([{ question: 'She ___ from Kyrgyzstan.', options: ['am', 'is', 'are'], correctIndex: 1 }]);
  });

  it('rejects a fill-blank sentence without ___', () => {
    const onSubmit = vi.fn();
    render(<ExerciseForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/instruction/i), { target: { value: 'Fill the gap.' } });
    fireEvent.change(screen.getByLabelText(/sentence/i), { target: { value: 'No blank here.' } });
    fireEvent.change(screen.getByLabelText(/accepted answers/i), { target: { value: 'on' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- components/exercises/ExerciseForm.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/exercises/ExerciseForm.tsx`**

```tsx
// components/exercises/ExerciseForm.tsx
'use client';

import { useState } from 'react';
import { Exercise, FillBlankItem, MultipleChoiceItem } from '@/types/models';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ExerciseFormProps {
  onSubmit: (exercise: Exercise) => void;
}

export function ExerciseForm({ onSubmit }: ExerciseFormProps) {
  const [type, setType] = useState<'fill-blank' | 'multiple-choice'>('fill-blank');
  const [instruction, setInstruction] = useState('');
  const [text, setText] = useState('');
  const [acceptedAnswers, setAcceptedAnswers] = useState('');
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setInstruction(''); setText(''); setAcceptedAnswers(''); setQuestion(''); setOptionsText(''); setCorrectIndex(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!instruction.trim()) {
      setError('Instruction is required.');
      return;
    }
    if (type === 'fill-blank') {
      if (!text.includes('___') || !acceptedAnswers.trim()) {
        setError('Sentence must contain ___ and at least one accepted answer.');
        return;
      }
      const item: FillBlankItem = { text: text.trim(), blanks: [acceptedAnswers.split(',').map((a) => a.trim()).filter(Boolean)] };
      onSubmit({ id: generateId(), type, instruction: instruction.trim(), items: [item] });
    } else {
      const options = optionsText.split(',').map((o) => o.trim()).filter(Boolean);
      if (!question.trim() || options.length < 2) {
        setError('Question and at least 2 comma-separated options are required.');
        return;
      }
      const item: MultipleChoiceItem = { question: question.trim(), options, correctIndex };
      onSubmit({ id: generateId(), type, instruction: instruction.trim(), items: [item] });
    }
    setError(null);
    reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button type="button" className={cn('rounded-full border px-3 py-1', type === 'fill-blank' && 'border-blue-600 bg-blue-600 text-white')} onClick={() => setType('fill-blank')}>
          Fill in the blank
        </button>
        <button type="button" className={cn('rounded-full border px-3 py-1', type === 'multiple-choice' && 'border-blue-600 bg-blue-600 text-white')} onClick={() => setType('multiple-choice')}>
          Multiple choice
        </button>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Instruction
        <input className="rounded border px-2 py-1" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
      </label>
      {type === 'fill-blank' ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Sentence (use ___ for the blank)
            <input className="rounded border px-2 py-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="The book is ___ the table." />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Accepted answers (comma-separated)
            <input className="rounded border px-2 py-1" value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder="on, on top of" />
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Question
            <input className="rounded border px-2 py-1" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Options (comma-separated)
            <input className="rounded border px-2 py-1" value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="am, is, are" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Correct option index (0-based)
            <input type="number" min={0} className="rounded border px-2 py-1" value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))} />
          </label>
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
    </form>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Write the failing test for the exercises list page**

```tsx
// app/exercises/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExercisesPage from './page';
import { useExercisesStore } from '@/lib/storage/exercisesStore';

describe('ExercisesPage', () => {
  beforeEach(() => {
    useExercisesStore.setState({
      items: [{ id: 'ex1', type: 'fill-blank', instruction: 'Fill the gap.', items: [{ text: 'a ___ b', blanks: [['x']] }] }],
      hydrated: true,
    });
  });

  it('lists each exercise instruction as a link to its attempt page', () => {
    render(<ExercisesPage />);
    const link = screen.getByRole('link', { name: /fill the gap/i });
    expect(link).toHaveAttribute('href', '/exercises/ex1');
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- app/exercises/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `app/exercises/page.tsx` and `app/exercises/[id]/page.tsx`**

```tsx
// app/exercises/page.tsx
'use client';

import Link from 'next/link';
import { useExercisesStore } from '@/lib/storage/exercisesStore';

export default function ExercisesPage() {
  const exercises = useExercisesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">✏️ Exercises</h1>
      {exercises.length === 0 && <p className="text-sm text-gray-500">No exercises yet — add one from + Add New.</p>}
      <ul className="flex flex-col gap-2">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link href={`/exercises/${ex.id}`} className="block rounded-lg border p-3 hover:bg-black/5 dark:hover:bg-white/10">
              {ex.instruction}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// app/exercises/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';

export default function ExerciseAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const exercise = useExercisesStore((s) => s.items.find((e) => e.id === id));

  if (!exercise) return <p className="text-sm text-gray-500">Exercise not found.</p>;

  return (
    <div className="mx-auto max-w-xl">
      <ExerciseRunner exercise={exercise} />
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS (remember the `next/navigation` mock rule from Global Constraints applies only to files exercising `useParams`/`usePathname` directly — `app/exercises/page.test.tsx` above does not use them, since it only renders `next/link`, which needs no mock)

- [ ] **Step 9: Wire Exercise into `app/add/page.tsx`**

```tsx
// app/add/page.tsx — add this import
import { ExerciseForm } from '@/components/exercises/ExerciseForm';
import { useExercisesStore } from '@/lib/storage/exercisesStore';
```

```tsx
// app/add/page.tsx — inside AddPage(), add alongside the other add* hooks
const addExercise = useExercisesStore((s) => s.add);
```

```tsx
// app/add/page.tsx — replace the Exercise placeholder branch
{type === 'Exercise' && (
  <ExerciseForm
    onSubmit={(exercise) => {
      addExercise(exercise);
      setSavedMessage('Exercise saved.');
    }}
  />
)}
```

- [ ] **Step 10: Run `npm run build` to confirm all exercise routes compile**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add components/exercises/ExerciseForm.tsx components/exercises/ExerciseForm.test.tsx app/exercises app/add/page.tsx
git commit -m "feat: add exercise authoring, list and attempt pages"
```

---

## Phase D — Homework

### Task 21: Homework progress/scoring logic

**Files:**
- Create: `lib/learning/homework.ts`
- Test: `lib/learning/homework.test.ts`

**Interfaces:**
- Consumes: `Exercise`, `ExerciseProgress`, `Homework`, `FillBlankItem`, `MultipleChoiceItem` from Task 2; `initFillBlankAnswers`, `initMultipleChoiceAnswers`, `scoreFillBlank`, `scoreMultipleChoice` from Task 18; `generateId` from Task 1.
- Produces: `initHomeworkProgress(exercises: Exercise[]): Record<string, ExerciseProgress>`, `computeHomeworkScore(homework: Homework): {correct,total}`, `homeworkProgressFraction(homework: Homework): {done,total}`, `parseHomeworkImport(raw: string): Homework`. Used by Tasks 22, 23.

- [ ] **Step 1: Write the failing test**

```ts
// lib/learning/homework.test.ts
import { describe, it, expect } from 'vitest';
import { initHomeworkProgress, computeHomeworkScore, homeworkProgressFraction, parseHomeworkImport } from './homework';
import { Exercise, Homework } from '@/types/models';

const exercises: Exercise[] = [
  { id: 'ex1', type: 'fill-blank', instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }, { text: 'They ___ here.', blanks: [['were']] }] },
];

describe('initHomeworkProgress', () => {
  it('creates blank progress matching each exercise item count', () => {
    const progress = initHomeworkProgress(exercises);
    expect(progress.ex1.userAnswers).toEqual([[''], ['']]);
    expect(progress.ex1.checked).toEqual([false, false]);
    expect(progress.ex1.correct).toEqual([false, false]);
  });
});

describe('computeHomeworkScore', () => {
  it('sums correct/total across all exercises using current progress answers', () => {
    const homework: Homework = {
      id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress',
      exercises,
      progress: { ex1: { userAnswers: [['was'], ['are']], checked: [true, true], correct: [true, false] } },
    };
    expect(computeHomeworkScore(homework)).toEqual({ correct: 1, total: 2 });
  });
});

describe('homeworkProgressFraction', () => {
  it('counts how many items have been checked out of the total', () => {
    const homework: Homework = {
      id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress',
      exercises,
      progress: { ex1: { userAnswers: [['was'], ['']], checked: [true, false], correct: [true, false] } },
    };
    expect(homeworkProgressFraction(homework)).toEqual({ done: 1, total: 2 });
  });
});

describe('parseHomeworkImport', () => {
  it('parses a valid JSON homework file into a Homework object with initialized progress', () => {
    const raw = JSON.stringify({
      title: 'Unit 11 — was/were',
      assignedDate: '2026-09-24',
      dueDate: '2026-09-26',
      sourceNote: 'from screenshot',
      exercises: [{ type: 'fill-blank', instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }],
    });
    const homework = parseHomeworkImport(raw);
    expect(homework.title).toBe('Unit 11 — was/were');
    expect(homework.status).toBe('not-started');
    expect(homework.exercises).toHaveLength(1);
    expect(homework.exercises[0].id).toBeTruthy();
    expect(homework.progress[homework.exercises[0].id].userAnswers).toEqual([['']]);
  });

  it('throws on missing required fields', () => {
    expect(() => parseHomeworkImport(JSON.stringify({ title: 'No exercises' }))).toThrow();
    expect(() => parseHomeworkImport(JSON.stringify({ exercises: [] }))).toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/homework.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/homework.ts`**

```ts
// lib/learning/homework.ts
import { Exercise, ExerciseProgress, FillBlankItem, Homework, MultipleChoiceItem } from '@/types/models';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from './exerciseProgress';
import { generateId } from '@/lib/utils';

export function initHomeworkProgress(exercises: Exercise[]): Record<string, ExerciseProgress> {
  const progress: Record<string, ExerciseProgress> = {};
  for (const ex of exercises) {
    const count = ex.items.length;
    progress[ex.id] = {
      userAnswers: ex.type === 'fill-blank'
        ? initFillBlankAnswers(ex.items as FillBlankItem[])
        : initMultipleChoiceAnswers(ex.items as MultipleChoiceItem[]),
      checked: Array(count).fill(false),
      correct: Array(count).fill(false),
    };
  }
  return progress;
}

export function computeHomeworkScore(homework: Homework): { correct: number; total: number } {
  let correct = 0;
  let total = 0;
  for (const ex of homework.exercises) {
    const progress = homework.progress[ex.id];
    if (!progress) continue;
    const score = ex.type === 'fill-blank'
      ? scoreFillBlank(ex.items as FillBlankItem[], progress.userAnswers as string[][])
      : scoreMultipleChoice(ex.items as MultipleChoiceItem[], progress.userAnswers as (number | null)[]);
    correct += score.correct;
    total += score.total;
  }
  return { correct, total };
}

export function homeworkProgressFraction(homework: Homework): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const ex of homework.exercises) {
    total += ex.items.length;
    const progress = homework.progress[ex.id];
    if (progress) done += progress.checked.filter(Boolean).length;
  }
  return { done, total };
}

export function parseHomeworkImport(raw: string): Homework {
  const data = JSON.parse(raw);
  if (!data.title || !Array.isArray(data.exercises) || data.exercises.length === 0) {
    throw new Error('Invalid homework file: expected { title, exercises: [...] } with at least one exercise.');
  }
  const exercises: Exercise[] = data.exercises.map((ex: any) => ({
    id: ex.id ?? generateId(),
    type: ex.type,
    instruction: ex.instruction,
    items: ex.items,
    explanation: ex.explanation,
    relatedGrammarTopicId: ex.relatedGrammarTopicId,
  }));
  return {
    id: data.id ?? generateId(),
    title: data.title,
    assignedDate: data.assignedDate ?? new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate,
    status: 'not-started',
    exercises,
    progress: initHomeworkProgress(exercises),
    sourceNote: data.sourceNote,
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/learning/homework.ts lib/learning/homework.test.ts
git commit -m "feat: add homework progress, scoring and JSON import parsing"
```

---

### Task 22: Homework list page

**Files:**
- Create: `app/homework/page.tsx`
- Test: `app/homework/page.test.tsx`

**Interfaces:**
- Consumes: `parseHomeworkImport`, `homeworkProgressFraction` from Task 21; `useHomeworkStore` from Task 6.
- Produces: `/homework` route listing assignments (date, title, progress, status, delete) with a JSON-file import button — this is the primary way a homework assignment created by Claude in chat (per design spec §9) enters the app. Used by Task 23 (links to `/homework/[id]`).

- [ ] **Step 1: Write the failing test**

```tsx
// app/homework/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeworkPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }];

describe('HomeworkPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useHomeworkStore.setState({ items: [], hydrated: true });
  });

  it('shows an empty state with no homework', () => {
    render(<HomeworkPage />);
    expect(screen.getByText(/no homework yet/i)).toBeInTheDocument();
  });

  it('lists an existing homework with its progress and status', () => {
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'not-started', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
    render(<HomeworkPage />);
    expect(screen.getByRole('link', { name: 'Unit 11' })).toHaveAttribute('href', '/homework/hw1');
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByText(/not started/i)).toBeInTheDocument();
  });

  it('imports a homework JSON file and adds it to the store', async () => {
    render(<HomeworkPage />);
    const file = new File(
      [JSON.stringify({ title: 'Unit 12', exercises: [{ type: 'fill-blank', instruction: 'Fill it.', items: [{ text: 'a ___ b', blanks: [['x']] }] }] })],
      'unit12.json',
      { type: 'application/json' }
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(useHomeworkStore.getState().items.some((h) => h.title === 'Unit 12')).toBe(true);
  });

  it('shows an error message for an invalid file', async () => {
    render(<HomeworkPage />);
    const file = new File([JSON.stringify({ title: 'Bad' })], 'bad.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(screen.getByText(/invalid homework file/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- app/homework/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `app/homework/page.tsx`**

```tsx
// app/homework/page.tsx
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { parseHomeworkImport, homeworkProgressFraction } from '@/lib/learning/homework';

export default function HomeworkPage() {
  const homeworks = useHomeworkStore((s) => s.items);
  const addHomework = useHomeworkStore((s) => s.add);
  const removeHomework = useHomeworkStore((s) => s.remove);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      addHomework(parseHomeworkImport(text));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import homework.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">📝 Homework</h1>
        <div>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => fileInputRef.current?.click()}>
            Import Homework (JSON)
          </button>
        </div>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {homeworks.length === 0 && (
        <p className="text-sm text-gray-500">No homework yet — send a screenshot in chat and import the generated file here.</p>
      )}
      {homeworks.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">Date</th>
              <th className="px-2 py-1">Homework</th>
              <th className="px-2 py-1">Progress</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {homeworks.map((hw) => {
              const { done, total } = homeworkProgressFraction(hw);
              return (
                <tr key={hw.id} className="border-b last:border-0">
                  <td className="px-2 py-1">{hw.assignedDate}</td>
                  <td className="px-2 py-1"><Link href={`/homework/${hw.id}`} className="text-blue-600 underline">{hw.title}</Link></td>
                  <td className="px-2 py-1">{done} / {total}</td>
                  <td className="px-2 py-1 capitalize">{hw.status.replace('-', ' ')}</td>
                  <td className="px-2 py-1"><button aria-label="Delete" onClick={() => removeHomework(hw.id)}>🗑</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/homework/page.tsx app/homework/page.test.tsx
git commit -m "feat: add homework list page with JSON import"
```

---

### Task 23: Homework runner page

**Files:**
- Create: `app/homework/[id]/page.tsx`
- Test: `app/homework/[id]/page.test.tsx`

**Interfaces:**
- Consumes: `FillBlankExercise`, `MultipleChoiceExercise` from Task 18; `isFillBlankItemCorrect`, `isMultipleChoiceItemCorrect` from Task 5; `computeHomeworkScore` from Task 21; `useHomeworkStore` from Task 6.
- Produces: `/homework/[id]` route: CHECK ANSWER per item (persisted to the store so "Continue Homework" resumes correctly), SUBMIT HOMEWORK once every item is checked, status transitions `not-started → in-progress → completed`.

- [ ] **Step 1: Write the failing test**

```tsx
// app/homework/[id]/page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeworkRunnerPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'hw1' }),
}));

const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }];

describe('HomeworkRunnerPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'not-started', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('marks the homework in-progress after the first answer change', () => {
    render(<HomeworkRunnerPage />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    expect(useHomeworkStore.getState().items[0].status).toBe('in-progress');
  });

  it('enables SUBMIT only once every item is checked, then records the score', () => {
    render(<HomeworkRunnerPage />);
    expect(screen.getByRole('button', { name: /submit homework/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByRole('button', { name: /submit homework/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /submit homework/i }));
    const updated = useHomeworkStore.getState().items[0];
    expect(updated.status).toBe('completed');
    expect(updated.score).toEqual({ correct: 1, total: 1 });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- app/homework/[id]/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `app/homework/[id]/page.tsx`**

```tsx
// app/homework/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { FillBlankExercise } from '@/components/exercises/FillBlankExercise';
import { MultipleChoiceExercise } from '@/components/exercises/MultipleChoiceExercise';
import { FillBlankItem, Homework, MultipleChoiceItem } from '@/types/models';
import { computeHomeworkScore } from '@/lib/learning/homework';
import { isFillBlankItemCorrect, isMultipleChoiceItemCorrect } from '@/lib/learning/checkAnswer';

export default function HomeworkRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const homework = useHomeworkStore((s) => s.items.find((h) => h.id === id));
  const update = useHomeworkStore((s) => s.update);

  if (!homework) return <p className="text-sm text-gray-500">Homework not found.</p>;

  function persist(next: Homework) {
    update(next.status === 'not-started' ? { ...next, status: 'in-progress' } : next);
  }

  function handleAnswerChange(exerciseId: string, itemIndex: number, blankIndex: number, value: string) {
    const progress = homework!.progress[exerciseId];
    const userAnswers = (progress.userAnswers as string[][]).map((a, idx) =>
      idx === itemIndex ? a.map((b, bi) => (bi === blankIndex ? value : b)) : a
    );
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, userAnswers } } });
  }

  function handleSelect(exerciseId: string, itemIndex: number, optionIndex: number) {
    const progress = homework!.progress[exerciseId];
    const userAnswers = (progress.userAnswers as (number | null)[]).map((v, idx) => (idx === itemIndex ? optionIndex : v));
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, userAnswers } } });
  }

  function handleCheck(exerciseId: string, itemIndex: number) {
    const ex = homework!.exercises.find((e) => e.id === exerciseId)!;
    const progress = homework!.progress[exerciseId];
    const item = ex.items[itemIndex];
    const isCorrect = ex.type === 'fill-blank'
      ? isFillBlankItemCorrect(item as FillBlankItem, progress.userAnswers[itemIndex] as string[])
      : isMultipleChoiceItemCorrect(item as MultipleChoiceItem, progress.userAnswers[itemIndex] as number | null);
    const checked = progress.checked.map((v, idx) => (idx === itemIndex ? true : v));
    const correct = progress.correct.map((v, idx) => (idx === itemIndex ? isCorrect : v));
    persist({ ...homework!, progress: { ...homework!.progress, [exerciseId]: { ...progress, checked, correct } } });
  }

  function handleSubmit() {
    const score = computeHomeworkScore(homework!);
    update({ ...homework!, status: 'completed', score });
  }

  const allChecked = homework.exercises.every((ex) => homework.progress[ex.id]?.checked.every(Boolean));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">{homework.title}</h1>
      <p className="mb-4 text-xs text-gray-500">
        Assigned {homework.assignedDate}{homework.dueDate ? ` · Due ${homework.dueDate}` : ''}
      </p>
      {homework.exercises.map((ex) => {
        const progress = homework.progress[ex.id];
        return (
          <div key={ex.id} className="mb-6">
            <p className="mb-2 font-medium">{ex.instruction}</p>
            {ex.type === 'fill-blank' ? (
              <FillBlankExercise
                items={ex.items as FillBlankItem[]}
                userAnswers={progress.userAnswers as string[][]}
                checked={progress.checked}
                onAnswerChange={(i, bi, v) => handleAnswerChange(ex.id, i, bi, v)}
                onCheck={(i) => handleCheck(ex.id, i)}
              />
            ) : (
              <MultipleChoiceExercise
                items={ex.items as MultipleChoiceItem[]}
                selected={progress.userAnswers as (number | null)[]}
                checked={progress.checked}
                onSelect={(i, oi) => handleSelect(ex.id, i, oi)}
                onCheck={(i) => handleCheck(ex.id, i)}
              />
            )}
          </div>
        );
      })}
      {homework.status === 'completed' && homework.score && (
        <p className="mb-3 font-medium">Score: {homework.score.correct} / {homework.score.total}</p>
      )}
      <button
        disabled={!allChecked}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        onClick={handleSubmit}
      >
        SUBMIT HOMEWORK
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Run `npm run build` to confirm the dynamic route compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add "app/homework/[id]/page.tsx" "app/homework/[id]/page.test.tsx"
git commit -m "feat: add homework runner page with persisted progress and scoring"
```

---

## Phase E — Games

### Task 24: Floating Words game

**Files:**
- Create: `lib/learning/floatingWords.ts`, `components/games/FloatingWords.tsx`, `app/games/floating-words/page.tsx`
- Test: `lib/learning/floatingWords.test.ts`, `components/games/FloatingWords.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2.
- Produces: `DIFFICULTY_CONFIG: Record<'easy'|'medium'|'hard', {poolSize:number; speedSeconds:number}>`, `pickFloatingRound<T>(pool, poolSize, random?): {target:T; bubbles:T[]} | null`; `<FloatingWords items={VocabItem[]} random?={()=>number} />`; `/games/floating-words` route.

- [ ] **Step 1: Write the failing test for `pickFloatingRound`**

```ts
// lib/learning/floatingWords.test.ts
import { describe, it, expect } from 'vitest';
import { pickFloatingRound, DIFFICULTY_CONFIG } from './floatingWords';

interface Item { id: string; english: string; }
const pool: Item[] = [{ id: '1', english: 'mother' }, { id: '2', english: 'chair' }, { id: '3', english: 'table' }, { id: '4', english: 'fridge' }];

describe('pickFloatingRound', () => {
  it('returns null for an empty pool', () => {
    expect(pickFloatingRound([], 4, () => 0)).toBeNull();
  });

  it('caps bubbles at poolSize and never exceeds the pool length', () => {
    const round = pickFloatingRound(pool, 2, () => 0);
    expect(round!.bubbles).toHaveLength(2);
    const round2 = pickFloatingRound(pool, 10, () => 0);
    expect(round2!.bubbles).toHaveLength(4);
  });

  it('always picks the target from among the bubbles', () => {
    const round = pickFloatingRound(pool, 4, () => 0.5);
    expect(round!.bubbles.map((b) => b.id)).toContain(round!.target.id);
  });

  it('defines easy/medium/hard difficulty configs', () => {
    expect(DIFFICULTY_CONFIG.easy.poolSize).toBeLessThan(DIFFICULTY_CONFIG.hard.poolSize);
    expect(DIFFICULTY_CONFIG.easy.speedSeconds).toBeGreaterThan(DIFFICULTY_CONFIG.hard.speedSeconds);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/floatingWords.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/floatingWords.ts`**

```ts
// lib/learning/floatingWords.ts
export interface FloatingWordsConfig { poolSize: number; speedSeconds: number; }

export const DIFFICULTY_CONFIG: Record<'easy' | 'medium' | 'hard', FloatingWordsConfig> = {
  easy: { poolSize: 4, speedSeconds: 18 },
  medium: { poolSize: 7, speedSeconds: 12 },
  hard: { poolSize: 10, speedSeconds: 7 },
};

function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickFloatingRound<T extends { id: string }>(
  pool: T[],
  poolSize: number,
  random: () => number = Math.random
): { target: T; bubbles: T[] } | null {
  if (pool.length === 0) return null;
  const bubbles = shuffled(pool, random).slice(0, Math.min(poolSize, pool.length));
  const target = bubbles[Math.floor(random() * bubbles.length)];
  return { target, bubbles };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/floatingWords.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `FloatingWords`**

```tsx
// components/games/FloatingWords.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingWords } from './FloatingWords';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'table', translation: 'стол', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('FloatingWords', () => {
  it('shows a target prompt and a bubble for every pool word', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    expect(screen.getByText(/найди слово:/i)).toBeInTheDocument();
    items.forEach((item) => {
      expect(screen.getByRole('button', { name: new RegExp(item.english) })).toBeInTheDocument();
    });
  });

  it('shows Correct when the bubble matching the target translation is clicked', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    const heading = screen.getByText(/найди слово:/i).textContent!;
    const targetItem = items.find((i) => heading.toUpperCase().includes(i.translation.toUpperCase()))!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(targetItem.english) }));
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it('shows Try again when a non-target bubble is clicked', () => {
    render(<FloatingWords items={items} random={() => 0} />);
    const heading = screen.getByText(/найди слово:/i).textContent!;
    const wrongItem = items.find((i) => !heading.toUpperCase().includes(i.translation.toUpperCase()))!;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(wrongItem.english) }));
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/games/FloatingWords.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/games/FloatingWords.tsx`**

```tsx
// components/games/FloatingWords.tsx
'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { pickFloatingRound, DIFFICULTY_CONFIG } from '@/lib/learning/floatingWords';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

interface FloatingWordsProps {
  items: VocabItem[];
  random?: () => number;
}

function hashPosition(id: string): { left: number; top: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  return { left: hash % 80, top: (hash * 7) % 70 };
}

export function FloatingWords({ items, random = Math.random }: FloatingWordsProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundKey, setRoundKey] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];
  const round = useMemo(() => pickFloatingRound(items, config.poolSize, random), [items, config.poolSize, random, roundKey]);

  function handleGuess(id: string) {
    if (!round) return;
    setResult(id === round.target.id ? 'correct' : 'wrong');
  }

  function nextRound() {
    setResult(null);
    setRoundKey((k) => k + 1);
  }

  if (!round) return <p className="text-sm text-gray-500">Add some words first.</p>;

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={cn('rounded-full border px-3 py-1 text-xs capitalize', difficulty === d && 'border-blue-600 bg-blue-600 text-white')}
            onClick={() => { setDifficulty(d); nextRound(); }}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mb-3 text-center text-lg font-bold">Найди слово: {round.target.translation.toUpperCase()}</p>
      <div className="relative h-64 overflow-hidden rounded-xl border">
        {round.bubbles.map((bubble) => {
          const { left, top } = hashPosition(bubble.id);
          return (
            <button
              key={bubble.id}
              className="absolute animate-float rounded-full bg-blue-100 px-3 py-1 text-sm dark:bg-blue-900"
              style={{ left: `${left}%`, top: `${top}%`, animationDuration: `${config.speedSeconds}s` }}
              onClick={() => handleGuess(bubble.id)}
            >
              🫧 {bubble.english}
            </button>
          );
        })}
      </div>
      {result === 'correct' && <p className="mt-3 text-green-600">✅ Correct!</p>}
      {result === 'wrong' && <p className="mt-3 text-red-600">❌ Try again</p>}
      {result && <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={nextRound}>Next word</button>}
    </div>
  );
}
```

- [ ] **Step 8: Add the floating animation keyframes to `app/globals.css`**

```css
/* app/globals.css — append */
@keyframes float-bubble {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
}

.animate-float {
  animation-name: float-bubble;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
```

- [ ] **Step 9: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 10: Implement `app/games/floating-words/page.tsx`**

```tsx
// app/games/floating-words/page.tsx
'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { FloatingWords } from '@/components/games/FloatingWords';

export default function FloatingWordsPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🫧 Floating Words</h1>
      <FloatingWords items={[...words, ...phrases]} />
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add lib/learning/floatingWords.ts lib/learning/floatingWords.test.ts components/games/FloatingWords.tsx components/games/FloatingWords.test.tsx app/games/floating-words/page.tsx app/globals.css
git commit -m "feat: add Floating Words game"
```

---

### Task 25: Matching Game

**Files:**
- Create: `lib/learning/matchingGame.ts`, `components/games/MatchingGame.tsx`, `app/games/matching/page.tsx`
- Test: `lib/learning/matchingGame.test.ts`, `components/games/MatchingGame.test.tsx`

**Interfaces:**
- Consumes: `VocabItem` from Task 2.
- Produces: `buildMatchingRound<T>(pool, count, random?): {leftItems:T[]; rightItems:T[]}`, `isMatch<T>(left,right): boolean`; `<MatchingGame items={VocabItem[]} count?={number} random?={()=>number} />`; `/games/matching` route.

- [ ] **Step 1: Write the failing test for the matching logic**

```ts
// lib/learning/matchingGame.test.ts
import { describe, it, expect } from 'vitest';
import { buildMatchingRound, isMatch } from './matchingGame';

interface Item { id: string; english: string; translation: string; }
const pool: Item[] = [
  { id: '1', english: 'mother', translation: 'мама' },
  { id: '2', english: 'chair', translation: 'стул' },
  { id: '3', english: 'table', translation: 'стол' },
];

describe('buildMatchingRound', () => {
  it('caps leftItems at count and never exceeds the pool length', () => {
    expect(buildMatchingRound(pool, 2, () => 0).leftItems).toHaveLength(2);
    expect(buildMatchingRound(pool, 10, () => 0).leftItems).toHaveLength(3);
  });

  it('rightItems is a permutation of the same ids as leftItems', () => {
    const { leftItems, rightItems } = buildMatchingRound(pool, 3, () => 0.7);
    expect(new Set(rightItems.map((i) => i.id))).toEqual(new Set(leftItems.map((i) => i.id)));
  });
});

describe('isMatch', () => {
  it('is true only when ids are equal', () => {
    expect(isMatch(pool[0], pool[0])).toBe(true);
    expect(isMatch(pool[0], pool[1])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/matchingGame.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/matchingGame.ts`**

```ts
// lib/learning/matchingGame.ts
function shuffled<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildMatchingRound<T extends { id: string }>(
  pool: T[],
  count: number,
  random: () => number = Math.random
): { leftItems: T[]; rightItems: T[] } {
  const leftItems = shuffled(pool, random).slice(0, Math.min(count, pool.length));
  const rightItems = shuffled(leftItems, random);
  return { leftItems, rightItems };
}

export function isMatch<T extends { id: string }>(left: T, right: T): boolean {
  return left.id === right.id;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/matchingGame.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `MatchingGame`**

```tsx
// components/games/MatchingGame.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingGame } from './MatchingGame';

const items = [
  { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '3', english: 'table', translation: 'стол', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('MatchingGame', () => {
  it('marks every correct pair matched and shows completion', () => {
    render(<MatchingGame items={items} count={3} random={() => 0} />);
    for (const item of items) {
      fireEvent.click(screen.getByRole('button', { name: item.english }));
      fireEvent.click(screen.getByRole('button', { name: item.translation }));
    }
    expect(screen.getByText('3 / 3 Correct 🎉')).toBeInTheDocument();
  });

  it('does not mark a wrong pair as matched', () => {
    render(<MatchingGame items={items} count={3} random={() => 0} />);
    fireEvent.click(screen.getByRole('button', { name: 'mother' }));
    fireEvent.click(screen.getByRole('button', { name: 'стул' }));
    expect(screen.queryByText(/correct 🎉/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'mother' })).not.toBeDisabled();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/games/MatchingGame.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `components/games/MatchingGame.tsx`**

```tsx
// components/games/MatchingGame.tsx
'use client';

import { useMemo, useState } from 'react';
import { VocabItem } from '@/types/models';
import { buildMatchingRound, isMatch } from '@/lib/learning/matchingGame';
import { cn } from '@/lib/utils';

interface MatchingGameProps {
  items: VocabItem[];
  count?: number;
  random?: () => number;
}

export function MatchingGame({ items, count = 5, random = Math.random }: MatchingGameProps) {
  const { leftItems, rightItems } = useMemo(() => buildMatchingRound(items, count, random), [items, count, random]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongRightId, setWrongRightId] = useState<string | null>(null);

  function handleLeftClick(id: string) {
    if (matched.has(id)) return;
    setSelectedLeft(id);
    setWrongRightId(null);
  }

  function handleRightClick(rightItem: VocabItem) {
    if (!selectedLeft || matched.has(rightItem.id)) return;
    const leftItem = leftItems.find((i) => i.id === selectedLeft)!;
    if (isMatch(leftItem, rightItem)) {
      setMatched((prev) => new Set(prev).add(leftItem.id));
      setSelectedLeft(null);
    } else {
      setWrongRightId(rightItem.id);
      setSelectedLeft(null);
    }
  }

  const done = leftItems.length > 0 && matched.size === leftItems.length;

  if (done) return <p className="text-lg font-bold">{matched.size} / {leftItems.length} Correct 🎉</p>;

  return (
    <div className="flex justify-center gap-8">
      <div className="flex flex-col gap-2">
        {leftItems.map((item) => (
          <button
            key={item.id}
            disabled={matched.has(item.id)}
            className={cn('rounded border px-3 py-1 text-sm', selectedLeft === item.id && 'border-blue-600 bg-blue-50', matched.has(item.id) && 'opacity-40')}
            onClick={() => handleLeftClick(item.id)}
          >
            {item.english}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {rightItems.map((item) => (
          <button
            key={item.id}
            disabled={matched.has(item.id)}
            className={cn('rounded border px-3 py-1 text-sm', wrongRightId === item.id && 'border-red-500 bg-red-50', matched.has(item.id) && 'opacity-40')}
            onClick={() => handleRightClick(item)}
          >
            {item.translation}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Implement `app/games/matching/page.tsx`**

```tsx
// app/games/matching/page.tsx
'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { MatchingGame } from '@/components/games/MatchingGame';

export default function MatchingGamePage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🔗 Matching Game</h1>
      <MatchingGame items={[...words, ...phrases]} />
    </div>
  );
}
```

- [ ] **Step 10: Run `npm run build` to confirm both game routes compile**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add lib/learning/matchingGame.ts lib/learning/matchingGame.test.ts components/games/MatchingGame.tsx components/games/MatchingGame.test.tsx app/games/matching/page.tsx
git commit -m "feat: add Matching Game"
```

---

## Phase F — Review, Progress & Home

### Task 26: Review queue and Review page

**Files:**
- Create: `lib/learning/reviewQueue.ts`, `app/review/page.tsx`
- Test: `lib/learning/reviewQueue.test.ts`, `app/review/page.test.tsx`

**Interfaces:**
- Consumes: `ReviewState` from Task 2; `toISODate` from Task 2; `FlashcardDeck` from Task 14; `useWordsStore`, `usePhrasesStore` from Task 6.
- Produces: `getDueItems<T>(items, today?): T[]`, `getMistakeSorted<T>(items): T[]`; `/review` route with Due-today / Practice-my-mistakes tabs.

- [ ] **Step 1: Write the failing test for the queue logic**

```ts
// lib/learning/reviewQueue.test.ts
import { describe, it, expect } from 'vitest';
import { getDueItems, getMistakeSorted } from './reviewQueue';
import { ReviewState } from '@/types/models';

function item(id: string, review: Partial<ReviewState>) {
  return { id, review: { status: 'review' as const, level: 1, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...review } };
}

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('getDueItems', () => {
  it('includes items due today or overdue, excludes future and null dates', () => {
    const items = [
      item('past', { nextReviewDate: '2026-09-20' }),
      item('today', { nextReviewDate: '2026-09-24' }),
      item('future', { nextReviewDate: '2026-10-01' }),
      item('none', { nextReviewDate: null }),
    ];
    const due = getDueItems(items, TODAY).map((i) => i.id);
    expect(due).toEqual(['past', 'today']);
  });
});

describe('getMistakeSorted', () => {
  it('excludes items with no mistakes and sorts the rest descending', () => {
    const items = [item('a', { mistakeCount: 1 }), item('b', { mistakeCount: 0 }), item('c', { mistakeCount: 5 })];
    expect(getMistakeSorted(items).map((i) => i.id)).toEqual(['c', 'a']);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/reviewQueue.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/reviewQueue.ts`**

```ts
// lib/learning/reviewQueue.ts
import { ReviewState } from '@/types/models';
import { toISODate } from './date';

export function getDueItems<T extends { review: ReviewState }>(items: T[], today: Date = new Date()): T[] {
  const todayStr = toISODate(today);
  return items.filter((i) => i.review.nextReviewDate !== null && i.review.nextReviewDate <= todayStr);
}

export function getMistakeSorted<T extends { review: ReviewState }>(items: T[]): T[] {
  return [...items].filter((i) => i.review.mistakeCount > 0).sort((a, b) => b.review.mistakeCount - a.review.mistakeCount);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm run test -- lib/learning/reviewQueue.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for the Review page**

```tsx
// app/review/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';

function reviewState(overrides: Partial<{ nextReviewDate: string | null; mistakeCount: number }>) {
  return { status: 'review' as const, level: 1, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ReviewPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2020-01-01', mistakeCount: 3 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ nextReviewDate: '2099-01-01', mistakeCount: 0 }) },
      ],
      hydrated: true,
    });
  });

  it('shows only due items on the Due today tab and finishes after answering the one due card', () => {
    render(<ReviewPage />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/tap to reveal/i));
    fireEvent.click(screen.getByRole('button', { name: /know/i }));
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('shows only items with mistakes on the Practice my mistakes tab', () => {
    render(<ReviewPage />);
    fireEvent.click(screen.getByRole('button', { name: /practice my mistakes/i }));
    expect(screen.getByText('mother')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- app/review/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 7: Implement `app/review/page.tsx`**

```tsx
// app/review/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { getDueItems, getMistakeSorted } from '@/lib/learning/reviewQueue';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { VocabItem } from '@/types/models';
import { cn } from '@/lib/utils';

type Tab = 'due' | 'mistakes';

export default function ReviewPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const updateWord = useWordsStore((s) => s.update);
  const updatePhrase = usePhrasesStore((s) => s.update);
  const [tab, setTab] = useState<Tab>('due');

  const all = useMemo(() => [...words, ...phrases], [words, phrases]);
  const dueItems = useMemo(() => getDueItems(all), [all]);
  const mistakeItems = useMemo(() => getMistakeSorted(all), [all]);
  const queue = tab === 'due' ? dueItems : mistakeItems;

  function handleUpdate(item: VocabItem) {
    if (words.some((w) => w.id === item.id)) updateWord(item);
    else updatePhrase(item);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">🔄 Review</h1>
      <div className="mb-4 flex gap-4 text-sm">
        <button className={cn(tab === 'due' && 'font-bold underline')} onClick={() => setTab('due')}>
          Due today ({dueItems.length})
        </button>
        <button className={cn(tab === 'mistakes' && 'font-bold underline')} onClick={() => setTab('mistakes')}>
          Practice my mistakes
        </button>
      </div>
      <FlashcardDeck items={queue} onUpdateItem={handleUpdate} />
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/learning/reviewQueue.ts lib/learning/reviewQueue.test.ts app/review/page.tsx app/review/page.test.tsx
git commit -m "feat: add review queue logic and Review page"
```

---

### Task 27: Progress stats, streak wiring, Progress page

**Files:**
- Create: `lib/learning/progressStats.ts`, `app/progress/page.tsx`
- Modify: `components/layout/StoreHydrator.tsx`
- Test: `lib/learning/progressStats.test.ts`, `components/layout/StoreHydrator.test.tsx`, `app/progress/page.test.tsx`

**Interfaces:**
- Consumes: `ReviewState` from Task 2; `toISODate` from Task 2; `useSettingsStore` (already has `recordActivity`) from Task 6.
- Produces: `computeProgressStats<T>(items, today?): {total,learned,learning,needsReview,accuracy}`; `/progress` route; `StoreHydrator` now also records today's streak activity on mount.

- [ ] **Step 1: Write the failing test for `computeProgressStats`**

```ts
// lib/learning/progressStats.test.ts
import { describe, it, expect } from 'vitest';
import { computeProgressStats } from './progressStats';
import { ReviewState } from '@/types/models';

function item(review: Partial<ReviewState>) {
  return { review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...review } };
}

const TODAY = new Date('2026-09-24T00:00:00Z');

describe('computeProgressStats', () => {
  it('counts total, learned, learning and needsReview', () => {
    const items = [
      item({ status: 'known' }),
      item({ status: 'new' }),
      item({ status: 'learning' }),
      item({ status: 'review', nextReviewDate: '2026-09-20' }),
    ];
    const stats = computeProgressStats(items, TODAY);
    expect(stats.total).toBe(4);
    expect(stats.learned).toBe(1);
    expect(stats.learning).toBe(2);
    expect(stats.needsReview).toBe(1);
  });

  it('computes accuracy as correct / (correct + mistakes), rounded, 0 when no answers yet', () => {
    expect(computeProgressStats([item({ correctCount: 4, mistakeCount: 1 })], TODAY).accuracy).toBe(80);
    expect(computeProgressStats([item({})], TODAY).accuracy).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/learning/progressStats.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/learning/progressStats.ts`**

```ts
// lib/learning/progressStats.ts
import { ReviewState } from '@/types/models';
import { toISODate } from './date';

export interface ProgressStats {
  total: number;
  learned: number;
  learning: number;
  needsReview: number;
  accuracy: number;
}

export function computeProgressStats<T extends { review: ReviewState }>(items: T[], today: Date = new Date()): ProgressStats {
  const total = items.length;
  const learned = items.filter((i) => i.review.status === 'known').length;
  const learning = items.filter((i) => i.review.status === 'new' || i.review.status === 'learning').length;
  const todayStr = toISODate(today);
  const needsReview = items.filter((i) => i.review.nextReviewDate !== null && i.review.nextReviewDate <= todayStr).length;
  const totalCorrect = items.reduce((sum, i) => sum + i.review.correctCount, 0);
  const totalAnswers = items.reduce((sum, i) => sum + i.review.correctCount + i.review.mistakeCount, 0);
  const accuracy = totalAnswers === 0 ? 0 : Math.round((totalCorrect / totalAnswers) * 100);
  return { total, learned, learning, needsReview, accuracy };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test -- lib/learning/progressStats.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for streak wiring in `StoreHydrator`**

```tsx
// components/layout/StoreHydrator.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StoreHydrator } from './StoreHydrator';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { toISODate } from '@/lib/learning/date';

describe('StoreHydrator', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({ theme: 'system', streak: 0, lastActiveDate: null, hydrated: false });
  });

  it('records activity for today on mount', () => {
    render(<StoreHydrator />);
    expect(useSettingsStore.getState().lastActiveDate).toBe(toISODate(new Date()));
    expect(useSettingsStore.getState().streak).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- components/layout/StoreHydrator.test.tsx`
Expected: FAIL (streak stays 0 / lastActiveDate stays null)

- [ ] **Step 7: Modify `components/layout/StoreHydrator.tsx` to record activity**

```tsx
// components/layout/StoreHydrator.tsx — inside the first useEffect, after loadSeedIfEmpty()
useWordsStore.getState().hydrate();
usePhrasesStore.getState().hydrate();
useGrammarStore.getState().hydrate();
useExercisesStore.getState().hydrate();
useHomeworkStore.getState().hydrate();
useSettingsStore.getState().hydrate();
loadSeedIfEmpty();
useSettingsStore.getState().recordActivity();
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Write the failing test for the Progress page**

```tsx
// app/progress/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';

function reviewState(overrides: Partial<{ status: 'new' | 'learning' | 'review' | 'known'; correctCount: number; mistakeCount: number }>) {
  return { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ProgressPage', () => {
  beforeEach(() => {
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'known', correctCount: 4, mistakeCount: 1 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'new' }) },
      ],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 6, lastActiveDate: '2026-09-24', hydrated: true });
  });

  it('shows vocabulary counts, accuracy and streak', () => {
    render(<ProgressPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/🔥 6 days/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run test, verify it fails**

Run: `npm run test -- app/progress/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 11: Implement `app/progress/page.tsx`**

```tsx
// app/progress/page.tsx
'use client';

import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { computeProgressStats } from '@/lib/learning/progressStats';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);
  const stats = computeProgressStats([...words, ...phrases]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">📊 Progress</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total words" value={stats.total} />
        <StatCard label="Learned" value={stats.learned} />
        <StatCard label="Learning" value={stats.learning} />
        <StatCard label="Needs review" value={stats.needsReview} />
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <p>Accuracy: <strong>{stats.accuracy}%</strong></p>
        <p>Streak: <strong>🔥 {streak} days</strong></p>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add lib/learning/progressStats.ts lib/learning/progressStats.test.ts components/layout/StoreHydrator.tsx components/layout/StoreHydrator.test.tsx app/progress/page.tsx app/progress/page.test.tsx
git commit -m "feat: add progress stats page and wire daily streak tracking"
```

---

### Task 28: Home page

**Files:**
- Modify: `app/page.tsx`
- Test: `app/page.test.tsx`

**Interfaces:**
- Consumes: `getDueItems` from Task 26; `useWordsStore`, `usePhrasesStore`, `useHomeworkStore`, `useSettingsStore` from Task 6.
- Produces: `/` route with greeting, today's due count, streak, START LEARNING button (→ `/review`), and a Continue-learning link to the first in-progress homework, if any.

- [ ] **Step 1: Write the failing test**

```tsx
// app/page.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

describe('HomePage', () => {
  beforeEach(() => {
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [{
        id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
        review: { status: 'review', level: 1, lastReviewed: null, nextReviewDate: '2020-01-01', correctCount: 0, mistakeCount: 0 },
      }],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 3, lastActiveDate: '2026-09-24', hydrated: true });
    const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'x', items: [{ text: 'a ___ b', blanks: [['x']] }] }];
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'in-progress', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('shows a greeting, due count, streak, and a continue-learning link', () => {
    render(<HomePage />);
    expect(screen.getByText(/good (morning|afternoon|evening), mjay/i)).toBeInTheDocument();
    expect(screen.getByText(/1 words to review/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥 3 day streak/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Unit 11' })).toHaveAttribute('href', '/homework/hw1');
    expect(screen.getByRole('link', { name: /start learning/i })).toHaveAttribute('href', '/review');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- app/page.test.tsx`
Expected: FAIL (current placeholder page has none of this content)

- [ ] **Step 3: Implement `app/page.tsx`**

```tsx
// app/page.tsx
'use client';

import Link from 'next/link';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { getDueItems } from '@/lib/learning/reviewQueue';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const homeworks = useHomeworkStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);

  const dueCount = getDueItems([...words, ...phrases]).length;
  const inProgressHomework = homeworks.find((h) => h.status === 'in-progress');

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-2 text-2xl font-bold">{greeting()}, MJay 👋</h1>
      <div className="mb-6 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
        <p>📚 {dueCount} words to review</p>
        <p>🔥 {streak} day streak</p>
      </div>
      <Link href="/review" className="inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-bold text-white">
        START LEARNING
      </Link>
      {inProgressHomework && (
        <div className="mt-6">
          <p className="mb-1 text-sm text-gray-500">Continue learning</p>
          <Link href={`/homework/${inProgressHomework.id}`} className="text-blue-600 underline">
            {inProgressHomework.title}
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Run `npm run build`**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: build Home page with today's stats and continue-learning"
```

---

## Phase G — Import/Export & polish

### Task 29: Import / Export

**Files:**
- Create: `lib/storage/exportImport.ts`
- Modify: `app/progress/page.tsx`, `app/progress/page.test.tsx`
- Test: `lib/storage/exportImport.test.ts`

**Interfaces:**
- Consumes: `Word`, `Phrase`, `GrammarTopic`, `Exercise`, `Homework` from Task 2; all collection stores from Task 6; `createInitialReviewState` from Task 4; `generateId` from Task 1.
- Produces: `exportAllData(): ExportedData`, `importAllData(raw: string): void` (upserts by id — never duplicates), `importVocabCsv(raw: string): number` (returns rows imported). Wired into the Progress page as "Export JSON / Import JSON / Import Vocabulary CSV" controls.

- [ ] **Step 1: Write the failing test**

```ts
// lib/storage/exportImport.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { exportAllData, importAllData, importVocabCsv } from './exportImport';
import { useWordsStore } from './wordsStore';
import { usePhrasesStore } from './phrasesStore';
import { useGrammarStore } from './grammarStore';
import { useExercisesStore } from './exercisesStore';
import { useHomeworkStore } from './homeworkStore';

const word = {
  id: 'w1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24',
  review: { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 },
};

describe('exportAllData / importAllData', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
    usePhrasesStore.setState({ items: [], hydrated: true });
    useGrammarStore.setState({ items: [], hydrated: true });
    useExercisesStore.setState({ items: [], hydrated: true });
    useHomeworkStore.setState({ items: [], hydrated: true });
  });

  it('exports everything currently in the stores', () => {
    useWordsStore.getState().add(word);
    const data = exportAllData();
    expect(data.version).toBe(1);
    expect(data.words).toEqual([word]);
  });

  it('imports words into the store', () => {
    importAllData(JSON.stringify({ version: 1, words: [word], phrases: [], grammarTopics: [], exercises: [], homeworks: [] }));
    expect(useWordsStore.getState().items).toEqual([word]);
  });

  it('upserts instead of duplicating an item that already exists with the same id', () => {
    useWordsStore.getState().add(word);
    importAllData(JSON.stringify({ version: 1, words: [{ ...word, translation: 'мамочка' }], phrases: [], grammarTopics: [], exercises: [], homeworks: [] }));
    expect(useWordsStore.getState().items).toHaveLength(1);
    expect(useWordsStore.getState().items[0].translation).toBe('мамочка');
  });
});

describe('importVocabCsv', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWordsStore.setState({ items: [], hydrated: true });
  });

  it('parses a header + rows CSV into new words', () => {
    const csv = 'english,translation,ipa,ruPronunciation,example,category\ndog,собака,dɒg,дог,I have a dog.,Other';
    expect(importVocabCsv(csv)).toBe(1);
    expect(useWordsStore.getState().items[0]).toMatchObject({ english: 'dog', translation: 'собака', category: 'Other' });
  });

  it('skips rows missing english/translation/category', () => {
    const csv = 'english,translation,ipa,ruPronunciation,example,category\n,собака,,,,Other';
    expect(importVocabCsv(csv)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- lib/storage/exportImport.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/storage/exportImport.ts`**

```ts
// lib/storage/exportImport.ts
import { Word, Phrase, GrammarTopic, Exercise, Homework } from '@/types/models';
import { useWordsStore } from './wordsStore';
import { usePhrasesStore } from './phrasesStore';
import { useGrammarStore } from './grammarStore';
import { useExercisesStore } from './exercisesStore';
import { useHomeworkStore } from './homeworkStore';
import { createInitialReviewState } from '@/lib/learning/review';
import { generateId } from '@/lib/utils';

export interface ExportedData {
  version: 1;
  words: Word[];
  phrases: Phrase[];
  grammarTopics: GrammarTopic[];
  exercises: Exercise[];
  homeworks: Homework[];
}

export function exportAllData(): ExportedData {
  return {
    version: 1,
    words: useWordsStore.getState().items,
    phrases: usePhrasesStore.getState().items,
    grammarTopics: useGrammarStore.getState().items,
    exercises: useExercisesStore.getState().items,
    homeworks: useHomeworkStore.getState().items,
  };
}

function upsert<T extends { id: string }>(
  store: { getState: () => { items: T[]; add: (i: T) => void; update: (i: T) => void } },
  item: T
): void {
  const exists = store.getState().items.some((i) => i.id === item.id);
  if (exists) store.getState().update(item);
  else store.getState().add(item);
}

export function importAllData(raw: string): void {
  const data = JSON.parse(raw) as Partial<ExportedData>;
  data.words?.forEach((w) => upsert(useWordsStore, w));
  data.phrases?.forEach((p) => upsert(usePhrasesStore, p));
  data.grammarTopics?.forEach((g) => upsert(useGrammarStore, g));
  data.exercises?.forEach((e) => upsert(useExercisesStore, e));
  data.homeworks?.forEach((h) => upsert(useHomeworkStore, h));
}

export function importVocabCsv(raw: string): number {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return 0;
  const rows = lines.slice(1);
  let count = 0;
  for (const row of rows) {
    const [english, translation, ipa, ruPronunciation, example, category] = row.split(',').map((c) => c.trim());
    if (!english || !translation || !category) continue;
    useWordsStore.getState().add({
      id: generateId(),
      english,
      translation,
      ipa: ipa || undefined,
      ruPronunciation: ruPronunciation || undefined,
      example: example || undefined,
      category,
      tags: [],
      dateAdded: new Date().toISOString().slice(0, 10),
      review: createInitialReviewState(),
    });
    count++;
  }
  return count;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test -- lib/storage/exportImport.test.ts`
Expected: PASS

- [ ] **Step 5: Extend the Progress page test with Export/Import cases**

Replace the full contents of `app/progress/page.test.tsx` with:

```tsx
// app/progress/page.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressPage from './page';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';

function reviewState(overrides: Partial<{ status: 'new' | 'learning' | 'review' | 'known'; correctCount: number; mistakeCount: number }>) {
  return { status: 'new' as const, level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0, ...overrides };
}

describe('ProgressPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePhrasesStore.setState({ items: [], hydrated: true });
    useWordsStore.setState({
      items: [
        { id: '1', english: 'mother', translation: 'мама', category: 'Family', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'known', correctCount: 4, mistakeCount: 1 }) },
        { id: '2', english: 'chair', translation: 'стул', category: 'Home', tags: [], dateAdded: '2026-09-24', review: reviewState({ status: 'new' }) },
      ],
      hydrated: true,
    });
    useSettingsStore.setState({ theme: 'system', streak: 6, lastActiveDate: '2026-09-24', hydrated: true });
  });

  it('shows vocabulary counts, accuracy and streak', () => {
    render(<ProgressPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/🔥 6 days/)).toBeInTheDocument();
  });

  it('exports data without throwing', () => {
    // @ts-expect-error test stub
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    // @ts-expect-error test stub
    URL.revokeObjectURL = vi.fn();
    render(<ProgressPage />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: /export json/i }))).not.toThrow();
  });

  it('imports vocabulary from a JSON export file', async () => {
    render(<ProgressPage />);
    const file = new File(
      [JSON.stringify({
        version: 1,
        words: [{ id: 'w9', english: 'dog', translation: 'собака', category: 'Other', tags: [], dateAdded: '2026-09-24', review: reviewState({}) }],
        phrases: [], grammarTopics: [], exercises: [], homeworks: [],
      })],
      'export.json',
      { type: 'application/json' }
    );
    const inputs = document.querySelectorAll('input[type="file"]');
    await userEvent.upload(inputs[0] as HTMLInputElement, file);
    expect(useWordsStore.getState().items.some((w) => w.id === 'w9')).toBe(true);
  });

  it('imports vocabulary from a CSV file', async () => {
    render(<ProgressPage />);
    const csv = 'english,translation,ipa,ruPronunciation,example,category\ncat,кот,kæt,кэт,I have a cat.,Other';
    const file = new File([csv], 'vocab.csv', { type: 'text/csv' });
    const inputs = document.querySelectorAll('input[type="file"]');
    await userEvent.upload(inputs[1] as HTMLInputElement, file);
    expect(useWordsStore.getState().items.some((w) => w.english === 'cat')).toBe(true);
  });
});
```

- [ ] **Step 6: Run test, verify it fails**

Run: `npm run test -- app/progress/page.test.tsx`
Expected: FAIL (Export/Import controls do not exist yet)

- [ ] **Step 7: Replace the full contents of `app/progress/page.tsx`**

```tsx
// app/progress/page.tsx
'use client';

import { useRef, useState } from 'react';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useSettingsStore } from '@/lib/storage/settingsStore';
import { computeProgressStats } from '@/lib/learning/progressStats';
import { exportAllData, importAllData, importVocabCsv } from '@/lib/storage/exportImport';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const words = useWordsStore((s) => s.items);
  const phrases = usePhrasesStore((s) => s.items);
  const streak = useSettingsStore((s) => s.streak);
  const stats = computeProgressStats([...words, ...phrases]);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mjay-english-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importAllData(await file.text());
    setImportMessage('Data imported.');
    e.target.value = '';
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const count = importVocabCsv(await file.text());
    setImportMessage(`Imported ${count} word(s) from CSV.`);
    e.target.value = '';
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">📊 Progress</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total words" value={stats.total} />
        <StatCard label="Learned" value={stats.learned} />
        <StatCard label="Learning" value={stats.learning} />
        <StatCard label="Needs review" value={stats.needsReview} />
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <p>Accuracy: <strong>{stats.accuracy}%</strong></p>
        <p>Streak: <strong>🔥 {streak} days</strong></p>
      </div>

      <div className="mt-8 border-t pt-4">
        <h2 className="mb-2 text-sm font-semibold">Your data</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded border px-3 py-1" onClick={handleExport}>Export JSON</button>
          <button className="rounded border px-3 py-1" onClick={() => jsonInputRef.current?.click()}>Import JSON</button>
          <button className="rounded border px-3 py-1" onClick={() => csvInputRef.current?.click()}>Import Vocabulary CSV</button>
          <input ref={jsonInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCsv} />
        </div>
        {importMessage && <p className="mt-2 text-xs text-green-600">{importMessage}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Run `npm run build`**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add lib/storage/exportImport.ts lib/storage/exportImport.test.ts app/progress/page.tsx app/progress/page.test.tsx
git commit -m "feat: add JSON export/import and vocabulary CSV import"
```

---

### Task 30: Final polish, README, manual QA pass

**Files:**
- Create: `README.md`
- Modify: none (verification-only task; fix anything the manual pass turns up in the relevant file from earlier tasks)

**Interfaces:**
- Consumes: the whole app built in Tasks 1-29.
- Produces: a documented, manually-verified, working local build. No new production code interfaces.

- [ ] **Step 1: Write `README.md`**

```markdown
# MJay English

Персональный интерактивный учебник английского. Работает полностью локально, без бэкенда — все данные хранятся в localStorage браузера.

## Запуск

\`\`\`bash
npm install
npm run dev
\`\`\`

Откройте http://localhost:3000

## Тесты

\`\`\`bash
npm run test
\`\`\`

## Добавление Homework

1. Пришлите скриншот/фото задания в чат Claude Code.
2. Claude сформирует JSON-файл с заданием (структура — см. `types/models.ts`, тип `Homework`/`Exercise`).
3. Откройте раздел Homework → Import Homework (JSON) → выберите файл.
4. Выполните задание в приложении, преподаватель проверит результат отдельно.

## Экспорт/импорт своих данных

Раздел Progress → Export JSON / Import JSON / Import Vocabulary CSV.
```

- [ ] **Step 2: Run the full test suite one final time**

Run: `npm run test`
Expected: PASS — every test file from Tasks 1-29.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: build succeeds with no TypeScript or lint errors.

- [ ] **Step 4: Manual QA pass in the browser**

Run: `npm run dev`, open http://localhost:3000, and work through this checklist (fix anything broken in the file it belongs to, from the relevant earlier task, then re-run `npm run test`):

- [ ] Home shows a greeting, due-today count, streak, and the START LEARNING button navigates to `/review`.
- [ ] Vocabulary: table view column hide/show buttons work, 🔒 Hide All hides everything, 🔀 Random reorders rows, search filters, add/edit/delete a word all persist after a page reload.
- [ ] Vocabulary: Flashcards mode direction toggle (EN→RU / RU→EN) works, 🔊 Listen speaks the word, ❌/🤔/✅ move to the next card.
- [ ] Vocabulary: Typing and Listening practice modes both work with the seed words.
- [ ] Phrases page mirrors all of the above using the phrases collection.
- [ ] Grammar: seed topics show explanation, examples, and an embedded practice exercise that can be checked.
- [ ] Exercises: author a new fill-blank and a new multiple-choice exercise from + Add New, then complete both from the Exercises list.
- [ ] Homework: import a JSON homework file, answer it, use CHECK ANSWER / Show correct answer, SUBMIT HOMEWORK, reload the page and confirm "Continue Homework" resumes with progress intact.
- [ ] Games: Floating Words (all 3 difficulties) and Matching Game both playable to completion.
- [ ] Review: Due-today and Practice-my-mistakes tabs both populate correctly after marking some words ❌ Don't know on Flashcards.
- [ ] Progress: numbers update after review/exercise activity; Export JSON downloads a file; Import JSON and Import Vocabulary CSV both add data.
- [ ] Resize to a mobile width (e.g. 375px) and confirm the bottom nav appears, tables scroll horizontally instead of overflowing the page, and no layout breaks.
- [ ] Toggle dark mode and confirm every page remains readable (text contrast, borders visible).
- [ ] Reload the app (hard refresh) and confirm all previously entered data is still present (localStorage persistence).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add README with run instructions and homework workflow"
```

---

## Self-Review Notes

- **Spec coverage:** every section of the Phase 1 design doc (`docs/superpowers/specs/2026-09-24-mjay-english-core-design.md`) maps to a task above — data model (Task 2), storage (3, 6), review scoring (4), seed data (7), theme/nav (8-9), Vocabulary/Phrases + all study modes (10-17), Grammar (19), Exercises (18, 20), Homework (21-23), Games (24-25), Review/Progress/Home (26-28), Import/Export (29), polish (30). The single explicit exclusion (full AI-OCR Homework pipeline) is intentionally absent, per design doc §12.
- **Placeholder scan:** no TBD/TODO/"add error handling"-style steps remain; every step has runnable code.
- **Type consistency:** `VocabItem`/`Word`/`Phrase` are the same alias used everywhere (Tasks 2, 11-17, 24-28); `ExerciseProgress.userAnswers` (`string[] | number | null`) matches usage in Tasks 18, 21-23; `CollectionState<T>` from Task 6 is the exact type imported in Task 17's `VocabSection`.
- **Fixed during drafting:** `createCollectionStore.add()` naively appends without de-duping by id, which would have caused duplicate entries if reused for import — Task 29 works around this with its own `upsert` helper rather than changing the Task 6 interface other tasks already depend on. Also added the `next/navigation` mocking rule to Global Constraints after noticing Task 9's original `Nav.test.tsx` draft would have failed without it, and applied the same pattern in Tasks 20 and 23.

