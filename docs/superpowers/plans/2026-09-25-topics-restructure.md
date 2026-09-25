# Topics Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the app around topics (words, phrases, rules and exercises together), with a 5-item Russian nav, a «Новое / не изученное» group and the unused pages removed.

**Architecture:** Topics are static metadata in code (`lib/seed/topics.ts`). Items join to them by `category === topic.id`, and grammar joins by `topicId`. Pure helpers in `lib/learning/topics.ts` do grouping, counts and progress. Pages `/topics` and `/topics/[id]` reuse the existing practice components (FlashcardDeck, TypingPractice, ListeningPractice, MatchingGame, FloatingWords, ExerciseRunner) on topic-scoped items.

**Tech Stack:** Next.js 15 app router, React 18, zustand, Tailwind, vitest + Testing Library.

Spec: `docs/superpowers/specs/2026-09-25-topics-restructure-design.md`

## Global Constraints

- All user-visible UI text in Russian. English only for the learning content itself.
- The app stays localStorage-only in this plan. Supabase is a later plan.
- Test command: `npx vitest run`. Types: `npx tsc --noEmit`. Build: `npx next build`. The dev server must be stopped before build.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Task 1: Topics data, helpers, recategorized and extra seed content

**Files:**
- Create: `lib/seed/topics.ts`, `lib/seed/extraWords.ts`, `lib/learning/topics.ts`, `lib/learning/topics.test.ts`
- Modify: `types/models.ts` (add `Topic`, `GrammarTopic.topicId?`), `lib/seed/words.ts`, `lib/seed/phrases.ts`, `lib/seed/grammar.ts` (categories become topic ids)

**Interfaces (produces):**
```ts
// types/models.ts
export interface Topic { id: string; title: string; emoji: string; group: 'class' | 'extra'; order: number }
// GrammarTopic gains: topicId?: string

// lib/seed/topics.ts
export const TOPICS: Topic[];
export const OTHER_TOPIC: Topic; // { id: 'other', title: 'Другое', emoji: '📦', group: 'class', order: 999 }

// lib/learning/topics.ts
export interface TopicContent { topic: Topic; words: VocabItem[]; phrases: VocabItem[]; grammar: GrammarTopic[]; exerciseCount: number }
export function buildTopicContents(topics: Topic[], words: VocabItem[], phrases: VocabItem[], grammar: GrammarTopic[]): TopicContent[]; // sorted by order; 'other' appended only if non-empty; empty topics are dropped
export function topicProgress(items: VocabItem[]): number; // 0..100, share with review.status 'review' | 'known'
export function newThisWeek(contents: TopicContent[], today?: Date): { topic: Topic; count: number }[]; // items with dateAdded within the last 7 days, including today
```

- [ ] Step 1: Write `lib/learning/topics.test.ts`:
  - `buildTopicContents` puts a word with `category:'home'` under `home`, a word with `category:'Family'` under `other`, grammar with `topicId:'home'` under `home`, and `exerciseCount` = the sum of `practiceExercises.length`.
  - Drops topics that have no content. Orders by `order`.
  - `topicProgress` gives 50 for [review, new], 0 for an empty list, and 100 for [known].
  - `newThisWeek` with today = 2026-09-25 counts an item dated 2026-09-19 and skips one dated 2026-09-18.
- [ ] Step 2: Run `npx vitest run lib/learning/topics.test.ts` → FAIL (module missing).
- [ ] Step 3: Implement `types`, `topics.ts` (13 class topics + 6 extra topics from the spec table) and the helpers.
- [ ] Step 4: Recategorize the seed:
  - words: Pronouns→`pronouns-to-be`, Home→`home`, Prepositions→`prepositions`, Verbs→`can`, Daily Routine→`present-simple`, Nature→`nature`, Numbers→`numbers`, Basic/Food/Feelings/People→`basic`
  - phrases: was / were→`was-were`, Prepositions→`prepositions`, There is / There are→`there-is-are`, Can→`can`, Directions→`directions`, Do you...?→`present-simple`, About me→`about-me`
  - grammar `topicId`: to-be-present→`pronouns-to-be`, was-were→`was-were`, there-is-are and some-any→`there-is-are`, can→`can`, prepositions→`prepositions`, do-you→`present-simple`, where-word-order→`directions`, main-rules→`rules`
- [ ] Step 5: Create `lib/seed/extraWords.ts`. It exports `seedExtraWords: Word[]` for the topics `numbers-11-100` (11–20, 21 as an example, 30–90, 100), `days`, `months`, `colors`, `family` and `food`. Each word has ipa, ruPronunciation, an example and its translation. Append it to `seedWords` via spread in `words.ts`.
- [ ] Step 6: Run the full suite. Fix `mergeSeed.test.ts` expectations if counts change. PASS.
- [ ] Step 7: Commit `feat: topics model with class and extra groups`.

### Task 2: mergeSeed refreshes content and retires old samples

**Files:** Modify `lib/seed/mergeSeed.ts`, `lib/seed/mergeSeed.test.ts`

**Interfaces (produces):** `export const RETIRED_SEED_IDS: string[]` in `mergeSeed.ts`. These are the ids of the old sample items: seed-word-mother, father, window, bread, water, friend, teacher, street, airport, left, right, meeting, deadline, morning; seed-phrase-how-are-you?, nice-to-meet-you., what-time-is-it?, i-have-no-idea.

- [ ] Step 1: Add the tests:
  - An existing seed word with an old `translation`/`category` and `review.level 3` is refreshed to the seed content and keeps level 3.
  - A store containing `seed-word-mother` loses it after `mergeSeed()`.
  - A user word (non-seed id) is untouched.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement. For seed items present locally, `update({ ...local, ...contentFieldsFromSeed })` only when a content field differs. Content fields: `english, translation, ipa, ruPronunciation, example, exampleTranslation, category, notes`. Remove any `RETIRED_SEED_IDS` present.
- [ ] Step 4: Run → PASS. Commit `feat: seed sync refreshes content and retires sample data`.

### Task 3: Topic UI components

**Files:**
- Create: `components/topics/TopicCard.tsx`, `components/topics/VocabCardList.tsx`, `components/topics/TopicPractice.tsx`, plus tests next to each

**Interfaces:**
- `TopicCard({ content }: { content: TopicContent })` is a link to `/topics/${id}`. It shows the emoji, title, counts line («N слов · N фраз · N упр», zero parts omitted) and a progress bar with `aria-label="Прогресс N%"`.
- `VocabCardList({ items }: { items: VocabItem[] })` renders a card per item: english + `ListenButton`, ruPronunciation, translation, example (+ exampleTranslation) and notes. The «Скрыть перевод» toggle replaces the translations with «нажмите, чтобы увидеть». Clicking a card reveals it.
- `TopicPractice({ items, onUpdateItem }: { items: VocabItem[]; onUpdateItem: (i: VocabItem) => void })` has mode buttons Карточки / Написание / На слух / Найди пару / Лови слова. It renders FlashcardDeck / TypingPractice / ListeningPractice / MatchingGame / FloatingWords with `items`.

- [ ] Step 1: Write the tests:
  - The TopicCard counts line reads «2 слова · 1 упр» when there are 2 words, 0 phrases and 1 exercise. Use `pluralRu(n, ['слово','слова','слов'])` from `lib/utils.ts`: 1 слово, 2 слова, 5 слов, 11 слов, 21 слово.
  - VocabCardList hides translations after the toggle and reveals one on click.
  - TopicPractice switches to typing mode.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement, adding `pluralRu` with a test in `lib/utils.test.ts`.
- [ ] Step 4: Run → PASS. Commit `feat: topic card, vocab cards and scoped practice`.

### Task 4: Pages /topics and /topics/[id]

**Files:** Create `app/topics/page.tsx`, `app/topics/[id]/page.tsx` and their tests.

- `/topics` shows the headings «Пройдено на уроках» and «Новое / не изученное», with a grid of `TopicCard` per group.
- `/topics/[id]` shows the title, then the tabs Слова · Фразы · Правило · Упражнения (tabs with no content are not rendered), then the «Тренировать» block with `TopicPractice` on words+phrases. The Правило tab renders `GrammarTopicCard` without exercises (add a prop `showExercises?: boolean`, default true). The Упражнения tab renders `ExerciseRunner` for each practice exercise, titled by its grammar topic. Updates are routed to the words or phrases store by id, as in `app/review/page.tsx`. Unknown id → «Тема не найдена».

- [ ] Step 1: Write the tests:
  - `/topics` renders both group headings with seeded stores.
  - `/topics/home` has a «Слова» tab and no «Правило» tab.
  - `/topics/was-were` shows «Упражнения».
- [ ] Step 2: Run → FAIL. Step 3: Implement. Step 4: Run → PASS. Commit `feat: topics pages`.

### Task 5: Nav, home page, removals

**Files:**
- Modify: `components/layout/Nav.tsx`, `app/page.tsx` and their tests
- Delete: `app/vocabulary`, `app/phrases`, `app/grammar`, `app/exercises`, `app/add`, `app/games`, `components/vocabulary/*`, `components/grammar/GrammarTopicForm*`, `components/exercises/ExerciseForm*`

- The nav LINKS are Главная `/`, Темы `/topics`, Повторение `/review`, Домашка `/homework`, Прогресс `/progress`. The mobile bar shows the icon plus a label. `/topics/...` highlights Темы (startsWith).
- Home, all in Russian:
  - greeting «Доброе утро / Добрый день / Добрый вечер»
  - «N слов на повторение», «🔥 N дней подряд» and the «НАЧАТЬ ПОВТОРЕНИЕ» button
  - «Новое на этой неделе» listing `newThisWeek` links
  - the in-progress homework link «Продолжить: …»
- [ ] Step 1: Update the tests:
  - The nav has exactly 5 links.
  - Home shows «Новое на этой неделе» when there is a word dated today.
- [ ] Step 2: FAIL → implement → delete the files → the full suite PASSES. `grep` finds no imports of deleted modules. Commit `feat: 5-item Russian nav and home, remove unused pages`.

### Task 6: Russian labels, Progress without export/import

**Files:** Modify `app/review/page.tsx`, `app/progress/page.tsx`, `app/homework/page.tsx`, `app/homework/[id]/page.tsx`, `components/flashcards/*`, `components/exercises/{TypingPractice,ListeningPractice,ExerciseRunner,FillBlankExercise,MultipleChoiceExercise}.tsx`, `components/games/*`, `components/grammar/GrammarTopicCard.tsx` and the matching tests (update the English text queries).

- [ ] Step 1: Translate every visible string, for example Check→Проверить, Next word→Следующее слово, Due today→На сегодня, Practice my mistakes→Мои ошибки, No cards to study yet.→Здесь пока нет карточек., Done for now!→На сегодня всё!, Total words→Всего, Learned→Выучено, Learning→Учу, Needs review→Повторить, Accuracy→Точность. Remove the export/import block and handlers from Progress.
- [ ] Step 2: Update the test queries. Run the full suite → PASS. Commit `feat: Russian UI labels`.

### Task 7: Verify and ship

- [ ] Run `npx vitest run`, `npx tsc --noEmit`. Stop the dev server, run `npx next build`, and all must pass.
- [ ] Start the dev server. Open `/`, `/topics`, `/topics/home` and `/topics/was-were` and check they return 200.
- [ ] Update the README sections (structure, how material is added). Push to `origin master`.
