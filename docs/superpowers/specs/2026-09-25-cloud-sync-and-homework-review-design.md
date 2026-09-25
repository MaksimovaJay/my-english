# Cloud sync + homework review — design

Date: 2026-09-25
Status: approved in chat, pending spec review

## Goal

1. Every device (phone, work laptop, home PC) shows the same data: words, phrases, grammar, exercises, homework, review progress, settings.
2. Homework is grouped by week and numbered (ДЗ 1, ДЗ 2 …), so "open ДЗ 5" is unambiguous.
3. Homework can contain free-text tasks with no auto-check.
4. The student sends a homework link to the teacher. The teacher opens it, marks each item ✔/✘, and leaves per-item and overall comments. The student sees the review on the same page.

## Decisions from the conversation

- Backend: Supabase (free tier). Project `my-english`, URL `https://duiqducynpxhastctfee.supabase.co`, publishable key `sb_publishable_A-J2lk_i7OX_qUQ-buYqEw_Q2OEGxrx`.
- **No login.** The site is open. Anyone with the link can read and write. The user accepted this explicitly. There is one shared data space.
- Teacher role is chosen by a link parameter (`?teacher=1`), not by an account.
- Teacher: views and comments, but does not create homework.
- Task types in homework: fill-in-the-blank (exists), multiple choice (exists), **free text (new)**.
- New homework keeps arriving via Claude. The user sends a photo or text, and Claude adds it to `lib/seed/homework.ts` and pushes. JSON import stays.

## Architecture

### Storage

One generic Supabase table mirrors the existing `StorageAdapter` (collection + id → JSON document):

```sql
create table public.documents (
  collection text not null,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
alter table public.documents enable row level security;
grant select, insert, update, delete on public.documents to anon;
create policy "open access" on public.documents
  for all to anon using (true) with check (true);
```

The user runs this SQL once in the Supabase SQL Editor. It is kept in the repo as `supabase/schema.sql`.

Collections: `words`, `phrases`, `grammar`, `exercises`, `homework`, `homework-reviews`, `settings`, `meta` (the seed-seen list).

### Adapter

- `StorageAdapter` becomes async: `list` and `set/remove` return Promises.
- Implementations:
  - `supabaseAdapter` is used in the app.
  - `memoryAdapter` is used in tests.
  - `localStorageAdapter` is kept only as the source for the one-time migration.
- Writes are **debounced per document (500 ms)**, because the homework runner updates on every keystroke. The last write wins.
- `createCollectionStore` keeps its synchronous API (`add/update/remove` change in-memory state immediately), so components don't change. Persistence is fire-and-forget. Failures go to a small `syncStatus` store, and a banner ("Не сохранилось — проверьте интернет") appears in the layout.
- `hydrate()` becomes async. `hydrated` stays false until data has loaded, and pages show "Загрузка…" until then.
- Supabase config lives in `lib/supabase/config.ts`, with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` overriding the hard-coded public defaults. Vercel therefore needs no env setup.

### Startup (StoreHydrator)

1. `await` hydrate of all collections in parallel.
2. **One-time migration:** if every remote collection is empty and this browser's localStorage has data, upload that data to Supabase.
3. `mergeSeed()`. The seed-seen list moves to `meta/seed-seen` in Supabase, so it is shared across devices. Homework seeds are add-only by id.
4. `recordActivity()`.

The homework runner page re-fetches its homework and review docs on window focus, so teacher comments appear without a manual reload. No realtime subscriptions.

## Homework changes

### Model

```ts
interface Homework {
  // existing fields…
  number: number;            // ДЗ N, unique, sequential
  submittedAt?: string;      // ISO datetime, set by "Отправить учителю"
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted';
}

interface FreeTextItem { prompt: string }        // exercise.type === 'free-text'
// progress.userAnswers[i] for free-text is a string

interface HomeworkReview {                       // collection 'homework-reviews', id = homework.id
  id: string;
  items: Record<string /*exerciseId*/, { verdict: ('correct' | 'incorrect' | null)[]; comment: string[] }>;
  overallComment: string;
  updatedAt: string;
}
```

- The review is a **separate document**, so the teacher and the student never overwrite each other's writes.
- "Проверено" is derived, not stored: the homework is `submitted` and a review exists with `updatedAt > submittedAt`.
- Existing homework without `number` gets one on load (ordered by `assignedDate`, then id).
- JSON import assigns `max(number) + 1`.

### List page `/homework`

- Grouped by week (Monday–Sunday) of `assignedDate`, newest week first. Heading: «Неделя 22–28 сентября».
- Row: «ДЗ 5 · чт 25.09 · title · progress · status».

### Runner page `/homework/[key]`

- `key` can be the number (`/homework/5`) or the id. Links use the number.
- Free-text item: a textarea saved as you type. It counts as done when the answer is non-empty. There is no «Check» button.
- **«Отправить учителю»** sets `status: 'submitted'` and `submittedAt`, then shares or copies `https://<site>/homework/5?teacher=1`. It uses `navigator.share` when available, otherwise the clipboard, and shows «Ссылка скопирована».
- The student sees teacher verdicts (✔/✘) and comments under each item, plus the overall comment on top.
- **Teacher mode (`?teacher=1`):** the student's answers are read-only. Each item gets ✔ / ✘ toggles and a comment field. An overall comment field sits at the bottom. Everything saves automatically to the review doc. A «Режим учителя» label is shown.

## Error handling

- Supabase unreachable on load: a banner says «Нет связи с базой», and stores stay empty and read-only. No silent fallback to localStorage, because that would split the data again.
- A write fails: the banner stays, and the next write of the same doc retries.

## Testing

- Unit: week grouping and labels, number assignment, derived reviewed status, free-text progress counting, `key` resolution (number vs id), migration decision (remote empty + local non-empty).
- Store tests run against `memoryAdapter`. The existing 178 tests are adapted to the async `hydrate`.
- Component tests: free-text item, teacher mode toggles and comments, the «Отправить учителю» share fallback.
- `next build` passes before push.

## Out of scope

- Login and per-user data.
- Realtime updates.
- Teacher creating homework.
- Offline mode.
- Updating content of already-seeded homework. Fixes to a delivered homework need a manual data edit.
