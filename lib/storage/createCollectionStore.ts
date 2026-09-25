import { create } from 'zustand';
import { StorageAdapter } from './types';
import { emitDocChange, registerCollection } from '@/lib/sync/changes';

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
  const useStore = create<CollectionState<T>>((set, get) => ({
    items: [],
    hydrated: false,
    hydrate: () => {
      set({ items: adapter.list<T>(collection), hydrated: true });
    },
    add: (item) => {
      adapter.set(collection, item);
      set({ items: [...get().items, item] });
      emitDocChange({ collection, id: item.id, item });
    },
    update: (item) => {
      adapter.set(collection, item);
      set({ items: get().items.map((i) => (i.id === item.id ? item : i)) });
      emitDocChange({ collection, id: item.id, item });
    },
    remove: (id) => {
      adapter.remove(collection, id);
      set({ items: get().items.filter((i) => i.id !== id) });
      emitDocChange({ collection, id, item: null });
    },
  }));

  registerCollection(collection, {
    list: () => useStore.getState().items,
    replaceAll: (items) => {
      adapter.replaceAll(collection, items as T[]);
      useStore.setState({ items: items as T[], hydrated: true });
    },
  });

  return useStore;
}
