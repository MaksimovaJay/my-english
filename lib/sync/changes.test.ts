import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onDocChange, syncedCollections } from './changes';
import { createCollectionStore } from '@/lib/storage/createCollectionStore';
import { localStorageAdapter } from '@/lib/storage/localStorageAdapter';

interface Item { id: string; value: string }

describe('collection store change events', () => {
  beforeEach(() => window.localStorage.clear());

  it('emits a change after add, update and remove', () => {
    const useStore = createCollectionStore<Item>('change-test', localStorageAdapter);
    const seen = vi.fn();
    const off = onDocChange(seen);
    useStore.getState().add({ id: '1', value: 'a' });
    useStore.getState().update({ id: '1', value: 'b' });
    useStore.getState().remove('1');
    off();
    expect(seen.mock.calls.map((c) => c[0])).toEqual([
      { collection: 'change-test', id: '1', item: { id: '1', value: 'a' } },
      { collection: 'change-test', id: '1', item: { id: '1', value: 'b' } },
      { collection: 'change-test', id: '1', item: null },
    ]);
  });

  it('registers the store so the sync engine can replace its items without emitting', () => {
    const useStore = createCollectionStore<Item>('registry-test', localStorageAdapter);
    const seen = vi.fn();
    const off = onDocChange(seen);
    syncedCollections().get('registry-test')!.replaceAll([{ id: '9', value: 'remote' }]);
    off();
    expect(useStore.getState().items).toEqual([{ id: '9', value: 'remote' }]);
    expect(localStorageAdapter.list('registry-test')).toEqual([{ id: '9', value: 'remote' }]);
    expect(seen).not.toHaveBeenCalled();
  });
});
