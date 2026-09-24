import { create } from 'zustand';
import { StorageAdapter } from './types';

export interface CollectionState<T> {
  items: T[];
  hydrated: boolean;
  hydrate: () => void;
  add: (item: T) => void;
  update: (item: T) => void;
  remove: (id: string) => void;
}

export function createCollectionStore<T extends { id: string }>(
  collection: string,
  adapter: StorageAdapter
) {
  return create<CollectionState<T>>((set, get) => ({
    items: [],
    hydrated: false,
    hydrate: () => {
      set({ items: adapter.list<T>(collection), hydrated: true });
    },
    add: (item) => {
      adapter.set(collection, item);
      set({ items: [...get().items, item] });
    },
    update: (item) => {
      adapter.set(collection, item);
      set({ items: get().items.map((i) => (i.id === item.id ? item : i)) });
    },
    remove: (id) => {
      adapter.remove(collection, id);
      set({ items: get().items.filter((i) => i.id !== id) });
    },
  }));
}
