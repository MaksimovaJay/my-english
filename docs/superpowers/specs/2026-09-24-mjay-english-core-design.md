# MJay English — Core App (Phase 1) — дизайн-документ

Дата: 2026-09-24
Статус: утверждено пользователем, готово к написанию implementation-плана

## 1. Контекст и объём (scope)

Персональное веб-приложение для изучения английского — "My English. Your rules. Your progress." Пользователь (MJay) сам наполняет базу словами/фразами/грамматикой, приложение превращает это в интерактивные упражнения, игры и систему повторения.

Исходное ТЗ пользователя описывало два разных по сложности блока:

1. **Core App** (этот документ) — вся обучающая система: словарь, фразы, грамматика, упражнения, игры, прогресс, повторение, Homework — полностью локально, без внешних сервисов, без бэкенда.
2. **Полноценный Homework AI** (OCR фото/PDF, AI-парсинг структуры, AI-проверка ответов с объяснением ошибок на естественном языке) — **не входит в Phase 1**. Вместо этого используется упрощённый рабочий процесс (см. раздел 9), где роль "AI-парсера" выполняет Claude в чате с пользователем, а проверка ответов в приложении — обычное сравнение со списком допустимых ответов (без вызовов внешних AI API). Полноценный автоматический AI Homework может стать отдельной фазой в будущем.

Единственный пользователь, без аутентификации. Работает только локально через `npm run dev`, без деплоя/хостинга (можно добавить позже). Код хранится в git, remote — `git@github.com:MaksimovaJay/my-english.git` (уже добавлен как origin; пуш только по явному запросу пользователя).

## 2. Технологии и структура проекта

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, lucide-react.
- Хранение данных: localStorage через адаптер (см. раздел 3) — позволяет позже подменить на IndexedDB/Supabase без изменения компонентов.
- Озвучка: Web Speech API (`speechSynthesis`), без внешних сервисов.

```
app/
  page.tsx                      # Home
  vocabulary/page.tsx
  phrases/page.tsx
  grammar/page.tsx
  exercises/page.tsx
  homework/page.tsx
  homework/[id]/page.tsx
  review/page.tsx
  progress/page.tsx
  add/page.tsx
  games/floating-words/page.tsx
  games/matching/page.tsx
components/
  vocabulary/   phrases/   grammar/   flashcards/
  exercises/    homework/  games/     progress/
  layout/       shared/
lib/
  storage/                       # адаптер + localStorage-реализация
  learning/                      # логика уровней/интервалов повторения, проверка ответов
  pronunciation/                 # обёртка над Web Speech API
  seed/                          # стартовые демо-данные
types/                           # общие TS-типы
```

## 3. Хранение данных

Каждая коллекция (words, phrases, grammarTopics, exercises, homeworks, settings, reviewLog) хранится через общий интерфейс адаптера:

```ts
interface StorageAdapter {
  list<T>(collection: string): T[];
  get<T>(collection: string, id: string): T | undefined;
  set<T>(collection: string, item: T & { id: string }): void;
  remove(collection: string, id: string): void;
}
```

Реализация Phase 1 — `localStorageAdapter` (JSON в `localStorage`, ключ на коллекцию). State в React читается через Zustand-сторы с `persist`, которые внутри вызывают адаптер — компоненты никогда не обращаются к `localStorage` напрямую.

При первом запуске (если коллекции пустые) подгружается небольшой seed-набор: ~15–20 слов, несколько фраз, 1–2 темы грамматики (по примерам из ТЗ — mother/chair/table и т.п.), которые пользователь может удалить/заменить.

## 4. Модели данных

```ts
type ReviewState = {
  status: 'new' | 'learning' | 'review' | 'known';
  level: number;           // 0-5
  lastReviewed: string | null;   // ISO date
  nextReviewDate: string | null; // ISO date
  correctCount: number;
  mistakeCount: number;
};

type Word = {
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
  dateAdded: string;
  review: ReviewState;
};

type Phrase = Omit<Word, 'example' | 'exampleTranslation'>; // фраза сама себе пример

type GrammarTopic = {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  practiceExercises: Exercise[];
  dateAdded: string;
};

type ExerciseType =
  | 'fill-blank' | 'multiple-choice' | 'translation' | 'word-order'
  | 'matching' | 'true-false' | 'listening' | 'writing' | 'reading' | 'image';

type FillBlankItem = {
  text: string;          // "Last year she ___ 22, so she ___ 23 now."
  blanks: string[][];    // по одному массиву допустимых ответов на каждый пропуск
};

type Exercise = {
  id: string;
  type: ExerciseType;
  instruction: string;
  items: FillBlankItem[] | MultipleChoiceItem[] | /* ... по типу */ unknown[];
  explanation?: string;
  relatedGrammarTopicId?: string;
  relatedWordIds?: string[];
};

type Homework = {
  id: string;
  title: string;
  assignedDate: string;
  dueDate?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  exercises: Exercise[];   // нумерованные блоки, как "11.2", "11.3"
  score?: { correct: number; total: number };
  sourceNote?: string;     // напр. "со скриншота от 24.09"
};
```

Проверка ответов (`lib/learning/checkAnswer.ts`) — сравнение введённого текста со списком допустимых ответов на пропуск/вопрос: нормализация (trim, lowercase, схлопывание пробелов), точное совпадение по нормализованной строке. Для типов без единственного правильного ответа (writing, часть translation) — self-check: пользователь сверяет с "Show correct answer" и сам отмечает верно/неверно.

## 5. Разделы и UX

- **Home** — приветствие, "N слов на повторение сегодня", кнопка Start Learning, "Continue learning" (последняя открытая тема/homework).
- **Vocabulary / Phrases** — переключатель вида **Table / Flashcards**.
  - Table: колонки English/Translation/Pronunciation/Example со своими 👁 toggle-кнопками (скрыть → показывается "???", клик по ячейке раскрывает), 🔀 Random (перемешать порядок), 🔒 Hide All (скрыть все колонки разом), фильтр по категории/тегам, поиск.
  - Flashcards: направление **EN→RU** / **RU→EN**, тап для раскрытия, 🔊 Listen, кнопки ❌ Don't know / 🤔 Hard / ✅ Know — обновляют `ReviewState`.
- **Grammar** — список тем; на каждой explanation + examples + встроенная практика (Exercise-блоки).
- **Exercises** — список созданных упражнений (все типы из раздела 4), прохождение с CHECK ANSWER → результат → SHOW CORRECT ANSWER доступен всегда → Next.
- **Homework** — список заданий (таблица: дата, название, прогресс, статус), открытие ведёт на страницу прохождения (та же механика, что Exercises, плюс SUBMIT HOMEWORK в конце → сохраняет score в историю, ошибки уходят в reviewLog). Незавершённое задание показывает "Continue Homework" с прогрессом на Home.
- **Review** — очередь items с `nextReviewDate <= сегодня` (слова+фразы), в формате как Flashcards; отдельно кнопка "Practice my mistakes" (сортировка по `mistakeCount`).
- **Progress** — total/learned/learning/needs review, accuracy %, streak (дней подряд с активностью), прогресс-бар за сегодня.
- **Add New** — форма с выбором типа (Word/Phrase/Grammar/Exercise/Note), поля по модели раздела 4.
- **Games**:
  - Floating Words — плавающие карточки-слова (CSS-анимация позиций, без canvas), задание "Найди слово: …", уровни Easy/Medium/Hard (кол-во слов и скорость).
  - Matching Game — две колонки (перемешанные), соединение кликами, финальный счёт.
  - Оба режима берут случайную выборку слов/фраз пользователя автоматически — отдельного наполнения не требуют.
- **Typing Practice** и **Listening Practice** — доступны как режимы внутри Vocabulary/Phrases (не требуют отдельного контента, всегда работают на текущем наборе слов).

## 6. Повторение (spaced repetition, упрощённая версия)

Уровни 0–5 с интервалами (дней до следующего повторения): `[0, 1, 3, 7, 14, 30]`.

- ❌ Don't know / неверный ответ → `level = max(0, level - 2)`, статус `learning`.
- 🤔 Hard → уровень не меняется.
- ✅ Know / верный ответ → `level = min(5, level + 1)`, статус `review` (или `known` при level=5).
- `nextReviewDate = сегодня + intervals[level]` дней.

Архитектура закладывается так, чтобы позже заменить на полноценный SM-2 без изменения схемы данных (поля `level`, `lastReviewed`, `nextReviewDate` уже общие).

## 7. Произношение

Три отдельных поля на слово/фразу — Written, IPA, Russian approximation (используется только как подсказка, никогда не заменяет английское произношение). Кнопка 🔊 Listen (Web Speech API, голос en-US/en-GB) доступна на карточках, во Flashcards, в Listening Practice и в форме добавления. Если `speechSynthesis` недоступен в браузере — кнопка скрывается.

## 8. Импорт/экспорт

- **Export** — JSON со всей базой (words, phrases, grammarTopics, exercises, homeworks, settings) + версия схемы.
- **Import** — JSON (полная база, с заменой/слиянием — уточняется на этапе реализации) и CSV только для словаря (`english,translation,ipa,ruPronunciation,example,category`).

## 9. Homework — упрощённый рабочий процесс (без OCR/AI-бэкенда)

1. Пользователь присылает скриншот/фото задания в чат Claude Code.
2. Claude вручную читает изображение и формирует объект `Homework` (с `Exercise`-блоками, сохраняя номера и структуру пропусков — как на примере 11.2/11.3 с was/were), задаёт `assignedDate`/`dueDate`.
3. Задание появляется в разделе Homework в приложении.
4. Пользователь заполняет пропуски вручную в интерфейсе, жмёт CHECK ANSWER (сравнение со списком допустимых ответов, без AI), может SHOW CORRECT ANSWER / Try Again.
5. По завершении — SUBMIT HOMEWORK, приложение считает score, ошибки уходят в общий список повторения.
6. Финальную проверку корректности делает живой преподаватель вне приложения — так что приложению не нужен "умный" AI-грейдер естественного языка.

Полноценный автоматический pipeline (загрузка PDF/фото прямо в приложении, OCR, AI-парсинг структуры, AI-проверка с объяснениями на естественном языке, AI-генерация доп. практики) — возможное будущее расширение, не в объёме Phase 1.

## 10. Тема и адаптивность

Light/dark через Tailwind `dark:` + переключатель в шапке (по умолчанию — системная тема), сохраняется в localStorage. Mobile-first: нижняя навигация на телефоне, боковая на десктопе, таблицы со горизонтальным скроллом на маленьких экранах.

## 11. Тестирование

Юнит-тесты: логика уровней повторения (`lib/learning`), проверка ответов (`checkAnswer`), storage-адаптер. Ручная проверка каждого экрана в браузере (десктоп + мобильная ширина) перед сдачей этапа.

## 12. Вне объёма Phase 1 (явно)

- Полноценный AI Homework (OCR/vision API, AI-проверка на естественном языке, AI-генерация доп. упражнений) — раздел 26 и 28-53 исходного ТЗ, кроме упрощённого процесса из раздела 9.
- Хостинг/деплой (только локальный запуск).
- Синхронизация между устройствами (данные живут в localStorage одного браузера).
- Полноценный SM-2 spaced repetition (заложена архитектура, не сам алгоритм).
