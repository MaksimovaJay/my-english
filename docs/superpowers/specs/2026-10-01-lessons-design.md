# Уроки (lessons) — design

Date: 2026-10-01
Status: described by the user in chat; details decided here; "остальное введем по факту работы"

## Goal

The teacher prepares a lesson. The learner sees it before the lesson; screenshots from it are sent to Claude, who turns them into interactive exercises inside the lesson (as with ДЗ 2). In class they work through it and play the chosen games. «Завершить урок» moves the material into Темы.

## Lesson

A lesson is a synced collection `lessons`:

```ts
interface Lesson {
  id: string;
  number: number;              // Урок N
  title: string;
  date: string;                // YYYY-MM-DD
  description?: string;
  images?: string[];
  words: { english: string; translation: string }[];   // kept inside the lesson until completion
  conditions?: string;         // «Условия»: what we do and in what order
  rules?: string;              // «Правила»: grammar explanation
  games: GameId[];             // games ticked for the lesson
  practice: Homework;          // exercises + progress, reusing the homework engine and UI
  status: 'planned' | 'completed';
  topicId?: string;            // the topic created on completion
}
```

`practice` is a Homework-shaped object, so every exercise type (fill-blank, multiple choice, free text, sentence order, word bank) and its progress logic is reused as is. When Claude converts screenshots, Claude appends exercises to `practice`.

## Creating (`/lessons`, «+ Новый урок»)

The form has these fields:
- title*, date (default today), description, images;
- words (`слово = перевод`), условия, правила;
- «🔤 Вставь слово» sentences with `[answers]` and extra words;
- «🧩 Собери предложение» sentences;
- game checkboxes: Карточки, Написание, На слух, Скажи, Собери предложение, Вставь слово, Буквы, Найди пару, Лови слова, На время. Default: Карточки, Найди пару, Собери предложение.

## Lesson page (`/lessons/[id]`)

The page shows, in order:
1. Header: «Урок N · title», date, status.
2. Description, then images (tap to open full size).
3. «📋 Условия», then «📖 Правило».
4. «📚 Слова» as cards.
5. «✏️ Упражнения», using the homework exercise components; answers are saved.
6. «🎮 Игры урока»: TopicPractice limited to the ticked games, over the lesson's words plus its sentence-order sentences (as phrases). Flashcard answers here do not touch the base, because the words are not in it yet.
7. «✅ Завершить урок», with a confirmation. A completed lesson shows a link «Открыть тему →».

## Completion (pure `completeLesson`)

- Topic: a new custom topic «🎓 {title}», group `class`.
- Words: new words go into the base with that topic as category. Existing words (same English) are reused and left where they are.
- Phrases: each sentence-order sentence becomes a phrase of the topic (translation, or «—»).
- Grammar topic `lesson-{id}`, created if there are rules or convertible exercises:
  - title «Правило: {title}»;
  - explanation = rules (and conditions);
  - practiceExercises = fill-blank and multiple-choice exercises as they are, plus word-bank exercises converted to fill-blank.
- The lesson becomes `status: completed` with its `topicId`.

## Navigation

A new nav item «Уроки» goes between Темы and Повторение (7 items). Mobile labels must stay readable.

## Testing

- Unit tests: `buildLesson` (parsing words and exercises, game list) and `completeLesson` (topic, new vs reused words, phrases, grammar conversion).
- Component tests: the form creates a lesson; the lesson page shows only the ticked games; completion moves the material and links to the topic.
- `next build`.
