# «Задать домашку» — design

Date: 2026-09-25
Status: approved in chat (option "Сразу делаю в приложении")

## Goal

From the Homework section, the user records a new assignment: the book exercise numbers, the teacher's notes and screenshots. The assignment is then done right in the app: every number gets a free-text answer field.

## Form (`/homework`, «+ Задать домашку»)

- «Номер в книге» rows: at least one. «+ ещё номер» adds a row, ✕ removes one. Empty rows are ignored, and the form is not saved if no row is filled.
- «Заметки учителя»: a textarea, optional.
- Screenshots: a file picker (multiple) plus paste (Ctrl+V) anywhere in the form, with previews and ✕ to remove.
- «Задано» (default today) and «Сдать до» (optional).
- Save creates the homework:
  - `number = max(existing numbers) + 1`
  - `title = "Упражнения 12.1, 12.3"`
  - one `free-text` exercise per row (`instruction = "Упражнение 12.1"`, one item `{ prompt: '' }`)
  - `teacherNotes`, `images`

## Model

- `ExerciseType` gains `'free-text'`. `FreeTextItem { prompt: string }` is added to the `Exercise.items` union.
- Free-text progress is `userAnswers[i] = [text]` (a `string[]`, as in fill-blank), and `checked[i] = text.trim() !== ''`.
- `Homework` gains `teacherNotes?: string` and `images?: string[]` (JPEG data URLs).
- Scoring (`computeHomeworkScore`) ignores free-text items, because the teacher checks them. Progress (`homeworkProgressFraction`) counts them through `checked`.
- `parseHomeworkImport` accepts `free-text`.

## Images

`lib/learning/images.ts` `compressImage(file: Blob): Promise<string>` downsizes to a max of 1600px on the long side and encodes JPEG at quality 0.75 via a canvas. A `QuotaExceededError` from localStorage while saving is caught, and the UI shows «Место в браузере закончилось — удалите старые скрины». The images move to Supabase Storage in the sync phase.

## Runner (`/homework/[id]`)

- Top: the teacher's notes, then the image gallery (click opens the full-size image in a new tab). Images can be added (picker or paste) and removed here too.
- A free-text exercise renders its instruction, then a textarea «Ваш ответ» that saves as you type.
- «СДАТЬ ДОМАШКУ» is enabled when every item is checked or answered. For a homework with only free-text exercises, the result line shows «Отправлено на проверку» instead of a score.

## Testing

- Unit tests: `nextHomeworkNumber`, `buildAssignedHomework` (rows → exercises, empty rows dropped), free-text progress, score ignoring free-text, and import accepting free-text.
- Component tests: the form adds and removes rows, saves with number 2, and blocks an empty save. The runner shows notes, saves a typed answer, and enables submit.
- Image compression is not unit-tested (jsdom has no canvas). It is verified in the browser.
