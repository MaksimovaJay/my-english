/** A local write to one document, reported so the sync engine can push it. item = null means deleted. */
export interface DocChange {
  collection: string;
  id: string;
  item: { id: string } | null;
}

type Listener = (change: DocChange) => void;
const listeners = new Set<Listener>();

export function onDocChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitDocChange(change: DocChange): void {
  listeners.forEach((l) => l(change));
}

/** How the sync engine reads and replaces a collection's local data (store state + cache). */
export interface SyncedCollection {
  list(): { id: string }[];
  replaceAll(items: { id: string }[]): void;
}

const registry = new Map<string, SyncedCollection>();

export function registerCollection(name: string, collection: SyncedCollection): void {
  registry.set(name, collection);
}

export function syncedCollections(): Map<string, SyncedCollection> {
  return registry;
}
