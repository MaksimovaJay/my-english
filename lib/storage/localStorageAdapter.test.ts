import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageAdapter } from './localStorageAdapter';

interface Item { id: string; value: string; }

describe('localStorageAdapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty list for an unknown collection', () => {
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('sets and lists items', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('words', { id: '2', value: 'b' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([
      { id: '1', value: 'a' },
      { id: '2', value: 'b' },
    ]);
  });

  it('overwrites an item with the same id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('words', { id: '1', value: 'updated' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([{ id: '1', value: 'updated' }]);
  });

  it('gets a single item by id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    expect(localStorageAdapter.get<Item>('words', '1')).toEqual({ id: '1', value: 'a' });
    expect(localStorageAdapter.get<Item>('words', 'missing')).toBeUndefined();
  });

  it('removes an item by id', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.remove('words', '1');
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('clears a whole collection', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.clear('words');
    expect(localStorageAdapter.list<Item>('words')).toEqual([]);
  });

  it('keeps collections isolated under a namespaced key', () => {
    localStorageAdapter.set<Item>('words', { id: '1', value: 'a' });
    localStorageAdapter.set<Item>('phrases', { id: '1', value: 'b' });
    expect(localStorageAdapter.list<Item>('words')).toEqual([{ id: '1', value: 'a' }]);
    expect(localStorageAdapter.list<Item>('phrases')).toEqual([{ id: '1', value: 'b' }]);
  });
});
