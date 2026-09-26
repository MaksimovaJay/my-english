# Games, daily plan and extras — design

Date: 2026-09-26
Status: approved in chat ("давай осуществим эти задачи"; items 1–9 except 7, which is already shipped)

## A. Three new games

These games appear on the Игры page and in the «Тренировать» block of every topic (TopicPractice). They reuse the auto-advance behaviour (`useAutoAdvance`, 0.7 s).

1. **Собери предложение** (`SentenceBuilder`)
   - **Pool:** phrases plus word examples (`example` with `exampleTranslation`), 3–9 words long.
   - **Tokens:** the sentence split on spaces, with the trailing `.?!` shown as a fixed ending. The Russian translation is shown as the prompt.
   - **Play:** tap a shuffled chip to append it to the answer line; tap an answer chip to take it back. When all chips are placed, the answer is auto-checked (case-insensitive).
     - Right → «✅ Верно!» and the next sentence.
     - Wrong → «❌ Попробуйте ещё раз»; chips stay so the order can be fixed.
2. **Буквы** (`LetterGuess`)
   - **Pool:** words matching `^[a-z' -]+$`, 3–14 letters. The prompt is the translation; spaces, `'` and `-` are shown from the start.
   - **Play:** an a–z letter pad. A wrong letter costs one of 6 lives.
     - Solved → next word.
     - Out of lives → the word is shown for 1.5 s, then the next word.
3. **На время** (`TimedQuiz`)
   - **Round:** 60 s. Each question shows an English word and 4 Russian options.
   - **Answering:** right → +1 and the next question immediately; wrong → a 0.3 s red flash, then the next question.
   - **End screen:** score, best score, and «Ещё раз».
   - **Best score:** `settings.bests.timed`, synced through the settings record.

## B. Word of the day

- A card on Главная shows the word, 🔊, its pronunciation, translation and example.
- **Pick:** a deterministic hash of today's date over words that are not `known`, falling back to all words. The word stays the same all day on every device.

## C. Quick add word

- **Button:** a floating «+» button on every page, above the mobile nav.
- **Dialog fields:** English*, перевод*, тема (default «Мои слова»), пример, перевод примера.
- **Save:** adds a Word with the chosen category and a fresh review state, so it goes straight into the topic and into Повторение.
- **New topic:** `my-words` «✍️ Мои слова» (group `class`, order 0), shown only when non-empty.

## D. Daily plan

On Главная, «План на сегодня» lists up to three tasks:

- **Повторить карточки:** target = min(10, due count at the start of the day), at least 1 if anything is due. The task is hidden when nothing is due.
- **Игры:** 10 right answers in any game or practice mode.
- **Домашка:** shown when there is an open homework (not completed). It is done when that homework is completed today.

Progress is stored in `settings.daily = { date, reviewed, gameCorrect, dueAtStart }`, which syncs and resets when the date changes. Flashcard outcomes increment `reviewed`; right answers in games increment `gameCorrect` (through `recordGameCorrect()`).

«Начать» opens the first unfinished task.

**Streak = plan completed.** `recordActivity()` is called when the plan becomes complete, not on app open. The reminder cron already checks `lastActiveDate`, so it now reminds when the plan is not done.

## E. Homework mistakes in review

On Повторение → «Мои ошибки», a block «Из домашки» collects every fill-blank or multiple-choice item that was checked wrong (`checked && !correct`) in any homework. They are shown as synthetic exercises, grouped by homework (ДЗ N · instruction), and run in `ExerciseRunner`. Doing them again does not change the homework itself.

## F. Speaking

«🎤 Скажи» (`SpeakPractice`) is a practice mode in TopicPractice and on the Игры page.

- **Recognition:** `webkitSpeechRecognition` / `SpeechRecognition` with `lang: en-US` and `maxAlternatives: 3`.
- **Right** (any alternative normalizes to the target) → ✅ and auto-advance.
- **Wrong** → «Я услышала: "…"» with a retry.
- Not supported → an explanation, plus a suggestion to use Chrome or Safari.

## Testing

Unit tests cover each piece of pure logic: the sentence pool and tokenizer, letter masking, quiz question building, the word-of-day pick, the plan computation, and homework-mistake collection. Component tests cover each game's right and wrong paths, the quick-add dialog, the plan card, and the speaking mode with a fake recognizer. `next build` passes.
