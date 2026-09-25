import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createSyncEngine } from './syncEngine';
import { Remote, RemoteDoc } from './remote';
import { createCollectionStore } from '@/lib/storage/createCollectionStore';
import { localStorageAdapter } from '@/lib/storage/localStorageAdapter';
import { useSyncStatus } from './syncStatus';

interface Item { id: string; v: string }
const useA = createCollectionStore<Item>('eng-a', localStorageAdapter);

function fakeRemote(initial: RemoteDoc[] = []) {
  const docs = new Map(initial.map((d) => [`${d.collection}/${d.id}`, d]));
  let online = true;
  const remote: Remote & { docs: typeof docs; setOnline(v: boolean): void } = {
    docs,
    setOnline: (v) => { online = v; },
    pullAll: vi.fn(async () => { if (!online) throw new Error('offline'); return [...docs.values()]; }),
    upsert: vi.fn(async (list: RemoteDoc[]) => { if (!online) throw new Error('offline'); list.forEach((d) => docs.set(`${d.collection}/${d.id}`, d)); }),
    remove: vi.fn(async (c: string, id: string) => { if (!online) throw new Error('offline'); docs.delete(`${c}/${id}`); }),
  };
  return remote;
}

const flushTimers = async () => { await vi.runOnlyPendingTimersAsync(); };

describe('syncEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    useA.setState({ items: [], hydrated: true });
  });
  afterEach(() => vi.useRealTimers());

  it('pull fills the stores from the server', async () => {
    const remote = fakeRemote([{ collection: 'eng-a', id: '1', data: { id: '1', v: 'server' } as Item }]);
    const engine = createSyncEngine({ remote, collections: ['eng-a'] });
    expect(await engine.start()).toEqual({ pulled: true });
    expect(useA.getState().items).toEqual([{ id: '1', v: 'server' }]);
    engine.stop();
  });

  it('pushes a local change after the debounce', async () => {
    const remote = fakeRemote([{ collection: 'eng-a', id: 'x', data: { id: 'x', v: 'keep' } as Item }]);
    const engine = createSyncEngine({ remote, collections: ['eng-a'], debounceMs: 500 });
    await engine.start();
    useA.getState().add({ id: '2', v: 'local' });
    expect(remote.upsert).not.toHaveBeenCalled();
    await flushTimers();
    expect(remote.docs.get('eng-a/2')?.data).toEqual({ id: '2', v: 'local' });
    useA.getState().remove('2');
    await flushTimers();
    expect(remote.docs.has('eng-a/2')).toBe(false);
    expect(useSyncStatus.getState().pending).toBe(0);
    engine.stop();
  });

  it('keeps changes while offline and sends them when back online', async () => {
    const remote = fakeRemote([{ collection: 'eng-a', id: 'x', data: { id: 'x', v: 'keep' } as Item }]);
    const engine = createSyncEngine({ remote, collections: ['eng-a'], debounceMs: 100 });
    await engine.start();
    remote.setOnline(false);
    useA.getState().add({ id: '3', v: 'offline edit' });
    await flushTimers();
    expect(useSyncStatus.getState().status).toBe('offline');
    expect(useSyncStatus.getState().pending).toBe(1);
    expect(JSON.parse(window.localStorage.getItem('mjay-english:pending')!)).toHaveProperty(['eng-a/3']);

    // a pull while offline-edits are pending must not lose them
    remote.setOnline(true);
    await engine.pull();
    expect(useA.getState().items.map((i) => i.id).sort()).toEqual(['3', 'x']);
    await engine.flush();
    expect(remote.docs.get('eng-a/3')?.data).toEqual({ id: '3', v: 'offline edit' });
    expect(useSyncStatus.getState().status).toBe('ok');
    engine.stop();
  });

  it('uploads local data when the server is empty (first sync)', async () => {
    useA.getState().add({ id: 'old', v: 'from this browser' });
    const remote = fakeRemote([]);
    const engine = createSyncEngine({ remote, collections: ['eng-a'] });
    await engine.start();
    expect(useA.getState().items).toEqual([{ id: 'old', v: 'from this browser' }]);
    expect(remote.docs.get('eng-a/old')?.data).toEqual({ id: 'old', v: 'from this browser' });
    engine.stop();
  });

  it('reports a failed first pull so seeding can be skipped', async () => {
    const remote = fakeRemote();
    remote.setOnline(false);
    const engine = createSyncEngine({ remote, collections: ['eng-a'] });
    expect(await engine.start()).toEqual({ pulled: false });
    expect(useSyncStatus.getState().status).toBe('offline');
    engine.stop();
  });
});
