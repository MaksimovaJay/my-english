import { describe, it, expect, beforeEach } from 'vitest';
import { createCollectionStore } from './createCollectionStore';
import { localStorageAdapter } from './localStorageAdapter';

interface Item { id: string; value: string; }

describe('createCollectionStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty and not hydrated', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    expect(useStore.getState().items).toEqual([]);
    expect(useStore.getState().hydrated).toBe(false);
  });

  it('hydrates from the adapter', () => {
    localStorageAdapter.set('test-items', { id: '1', value: 'a' });
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().hydrate();
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'a' }]);
    expect(useStore.getState().hydrated).toBe(true);
  });

  it('add() persists via the adapter and updates state', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'a' }]);
    expect(localStorageAdapter.list<Item>('test-items')).toEqual([{ id: '1', value: 'a' }]);
  });

  it('update() replaces an existing item', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    useStore.getState().update({ id: '1', value: 'b' });
    expect(useStore.getState().items).toEqual([{ id: '1', value: 'b' }]);
  });

  it('remove() deletes an item', () => {
    const useStore = createCollectionStore<Item>('test-items', localStorageAdapter);
    useStore.getState().add({ id: '1', value: 'a' });
    useStore.getState().remove('1');
    expect(useStore.getState().items).toEqual([]);
    expect(localStorageAdapter.list<Item>('test-items')).toEqual([]);
  });
});
