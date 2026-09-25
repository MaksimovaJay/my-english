# Sync v2 — design (supersedes the storage part of cloud-sync-and-homework-review)

Date: 2026-09-25
Status: approved in chat ("синхрон нужен 100%, занимаюсь с телефона и с компа, и иногда вне дома")

## What changed vs. the earlier spec

- **No teacher mode.** The app is personal. The teacher may open the same site and use «Задать домашку», which needs no special mode. No review UI and no teacher links.
- **Offline-first instead of "no fallback".** localStorage stays as a local cache, and Supabase is the source of truth. The app opens instantly from the cache, then pulls. Edits queue up when offline and are pushed later. This matters because the user studies away from home.

## Data

The Supabase table `public.documents(collection, id, data jsonb, updated_at)` has already been created and verified (read, write, delete with the publishable key). Every existing collection syncs: `words, phrases, grammar, exercises, homeworks, settings, meta` (meta holds `seed-seen`).

## Engine (`lib/sync/`)

- `remote.ts`: fetch-based PostgREST calls — `pullAll()`, `upsertDoc()`, `deleteDoc()` — with URL and key from `lib/supabase/config.ts`.
- `changes.ts`: a tiny event bus. Collection stores, the settings store and the seed-seen writer emit `{collection, id, item | null}` after every local write. Tests that never start the engine are unaffected.
- `syncEngine.ts`:
  - **Pending queue:** per `collection/id`, the last op wins. It is persisted in localStorage `mjay-english:pending`, so it survives reloads, and debounced for 600 ms because answers update on every keystroke. It flushes on `pagehide` / `visibilitychange=hidden` with `keepalive`, and on the `online` event.
  - **Pull:** fetch all remote docs, overlay the pending ops, replace every store's items and the local cache. It runs at startup and whenever the tab becomes visible again. That is how the phone sees what the computer did.
  - **Migration:** on the first successful pull, if the remote is completely empty and the local cache has data, the local data is uploaded.
  - **Seeds:** `mergeSeed()` runs only after a successful pull. Seeding a stale or empty cache and pushing it would overwrite real progress on the server. `recordActivity()` also runs after the pull, or after a failed pull when the cache is not empty.
  - A status store `useSyncStatus` holds `syncing | ok | offline` plus a pending count. A small banner shows «Нет связи — изменения сохранятся и отправятся, когда появится интернет».
- **Conflicts:** last write wins per document. This is fine for one person on several devices.

## Images

`uploadImage(dataUrl)` sends the file to the public bucket `homework-images` and returns its public URL. If the upload fails (bucket missing, offline), the data URL is kept, so nothing is lost. Existing data URLs keep working.

## Homework by week

The `/homework` list is grouped by week (Monday–Sunday) of `assignedDate`, newest first, under headings like «Неделя 22–28 сентября».

## Testing

- Unit tests for the engine with a fake fetch:
  - pull fills the stores;
  - a local change is queued, debounced and upserted;
  - pending ops overlay the pull;
  - offline keeps the queue and it flushes on `online`;
  - migration when the remote is empty;
  - `mergeSeed` is not run when the pull fails.
- Unit tests for week grouping and labels.
- `next build` passes. A manual check against the real Supabase: add a word on one origin and see it on another.
