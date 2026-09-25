# Topics restructure — design

Date: 2026-09-25
Status: approved in chat ("свою рекомендацию можешь начинать делать")
Comes before: `2026-09-25-cloud-sync-and-homework-review-design.md` (Supabase + homework)

## Problem

- Navigation has 11 items. On a phone it is 11 unlabeled icons.
- The vocabulary is one flat table of 100+ words. Categories exist in the data but are not used.
- One subject is split across four pages: Vocabulary, Phrases, Grammar and Exercises.
- Grammar is one long page. The vocabulary table scrolls sideways on a phone.
- The UI is in English, but the learner is a Russian-speaking beginner.
- Add New, Exercises and Import/Export are unused. Content arrives through Claude, from photos of book pages.

## Workflow this serves

The teacher gives material from books (Murphy, Essential Grammar in Use). The user photographs the pages and sends them to Claude. Claude puts words, phrases, rules and book exercises into a **topic**, creating the topic if needed. Homework goes to Домашка.

## Topics

A topic is defined in code in `lib/seed/topics.ts`:

```ts
interface Topic { id: string; title: string; emoji: string; group: 'class' | 'extra'; order: number }
```

- `group: 'class'` is material covered in lessons («Пройдено на уроках»).
- `group: 'extra'` is new, not yet studied material («Новое / не изученное»): words only, no rules.
- Words and phrases belong to a topic through `category === topic.id`.
- Grammar topics get an optional `topicId`. A topic's «Упражнения» are the `practiceExercises` of its grammar topics.
- Items whose category matches no topic (old data, CSV imports) are shown under «Другое», which appears only when non-empty.

**Class topics** are built from the lesson base already delivered:

| id | title | contents |
|---|---|---|
| pronouns-to-be | Местоимения и to be | pronoun words; am/is/are rule |
| about-me | О себе | "I am 27 years old…" phrases |
| home | Дом и квартира | home words |
| prepositions | Предлоги места | preposition words and phrases; rule |
| there-is-are | There is / There are, some / any | phrases; two rules |
| can | Can и глаголы | verbs; can phrases; rule |
| present-simple | Do you…? и распорядок дня | routine words; Do you phrases; rule |
| directions | Направления | phrases; "where it is" rule |
| was-were | was / were | phrases; rule and exercises 11.2–11.4 |
| basic | Базовые слова | basic, food, feelings and people words |
| nature | Природа | nature words |
| numbers | Числа 0–10 | numbers |
| rules | Главные правила | the cheat-sheet grammar topic |

**Extra topics:** Числа 11–100, Дни недели, Месяцы, Цвета, Семья, Еда и напитки. Each item has a translation, IPA, Russian-letter pronunciation and one example.

## Seed sync changes (mergeSeed)

- Seed words and phrases that already exist locally get their **content fields** refreshed from the seed (`english, translation, ipa, ruPronunciation, example, exampleTranslation, category, notes`). `review` is kept. Recategorization and typo fixes therefore reach every device.
- A `retiredSeedIds` list removes the old sample words (mother, deadline, airport…) from devices that still have them.

## Navigation (Russian, 5 items)

Главная `/` · Темы `/topics` · Повторение `/review` · Домашка `/homework` · Прогресс `/progress`

The mobile bottom bar shows the 5 icons with short labels.

## Pages

- **Главная:** greeting, the number of words due, streak and «Начать повторение». Below that:
  - «Новое на этой неделе»: topics with items added in the last 7 days, as links.
  - A homework in progress, if there is one.
- **Темы:** two sections, «Пройдено на уроках» and «Новое / не изученное». Each is a grid of topic cards: emoji, title, counts (N слов · N фраз · N упр), and a progress bar (share of items with status `review` or `known`).
- **Тема `/topics/[id]`:**
  - Tabs: Слова · Фразы · Правило · Упражнения. Empty tabs are hidden.
  - A «Тренировать» block with Карточки · Написание · На слух · Найди пару · Лови слова, scoped to the topic's words and phrases.
  - Word and phrase list: cards, not a table. Each card shows the English word with 🔊, the Russian-letter pronunciation, the translation and the example.
  - A «Скрыть перевод» toggle hides translations; tapping a card reveals it.
- **Повторение:** unchanged logic, Russian labels.
- **Прогресс:** Russian stats. Export/Import is removed.
- **Домашка:** unchanged for now, redone in the Supabase phase. Labels translated.

## Removed

The pages `/vocabulary`, `/phrases`, `/grammar`, `/exercises`, `/add`, `/games/*` and their now-unused components and tests: VocabSection, VocabTable, VocabForm, GrammarTopicForm, ExerciseForm, and the export/import UI.
`lib/storage/exportImport.ts` stays, because the Supabase migration will reuse its readers.

## Testing

- Unit tests: topic grouping and counts, progress share, «Другое» fallback, content refresh and retirement in `mergeSeed`, the new-this-week selection.
- Component tests: the topics page renders both groups, tabs hide when empty, the translation toggle works, the nav has 5 items.
- `npm test`, `tsc` and `next build` all pass.
