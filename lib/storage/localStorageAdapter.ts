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
