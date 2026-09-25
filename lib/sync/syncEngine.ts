import { DocChange, onDocChange, syncedCollections } from './changes';
import { Remote, RemoteDoc } from './remote';
import { useSyncStatus } from './syncStatus';

const PENDING_KEY = 'mjay-english:pending';

interface PendingOp {
  collection: string;
  id: string;
  item: { id: string } | null; // null = delete
}

type Pending = Record<string, PendingOp>; // key = collection/id; the latest local write wins

function loadPending(): Pending {
  try {
    return JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? '{}') as Pending;
  } catch {
    return {};
  }
}

interface EngineOptions {
  remote: Remote;
  /** Collections to sync; defaults to every registered one. */
  collections?: string[];
  debounceMs?: number;
  retryMs?: number;
}

/**
 * Offline-first sync between the local stores (localStorage cache) and Supabase.
 * Local writes are queued (persisted, debounced) and pushed; pulls replace local data
 * with the server's, keeping any queued writes on top so nothing typed offline is lost.
 */
export function createSyncEngine({ remote, collections, debounceMs = 600, retryMs = 15000 }: EngineOptions) {
  let pending: Pending = loadPending();
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let flushing: Promise<void> | null = null;
  let lastPull = 0;
  const cleanups: (() => void)[] = [];

  const names = () => collections ?? [...syncedCollections().keys()];

  function savePending() {
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
      // storage full: the queue still lives in memory for this session
    }
    useSyncStatus.setState({ pending: Object.keys(pending).length });
  }

  function enqueue(change: DocChange) {
    if (!names().includes(change.collection)) return;
    pending = { ...pending, [`${change.collection}/${change.id}`]: { ...change } };
    savePending();
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void flush(), debounceMs);
  }

  async function flush(opts?: { keepalive?: boolean }): Promise<void> {
    if (flushing) await flushing;
    const snapshot = pending;
    const ops = Object.values(snapshot);
    if (ops.length === 0) return;
    flushing = (async () => {
      try {
        const upserts: RemoteDoc[] = ops.filter((o) => o.item).map((o) => ({ collection: o.collection, id: o.id, data: o.item! }));
        await remote.upsert(upserts, opts);
        for (const o of ops.filter((o) => !o.item)) await remote.remove(o.collection, o.id, opts);
        const next = { ...pending };
        for (const [key, op] of Object.entries(snapshot)) if (next[key] === op) delete next[key];
        pending = next;
        savePending();
        useSyncStatus.setState({ status: 'ok' });
      } catch {
        useSyncStatus.setState({ status: 'offline' });
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => void flush(), retryMs);
      } finally {
        flushing = null;
      }
    })();
    await flushing;
  }

  function apply(docs: RemoteDoc[]) {
    const registry = syncedCollections();
    for (const name of names()) {
      const target = registry.get(name);
      if (!target) continue;
      const items = new Map(docs.filter((d) => d.collection === name).map((d) => [d.id, d.data]));
      for (const op of Object.values(pending)) {
        if (op.collection !== name) continue;
        if (op.item) items.set(op.id, op.item);
        else items.delete(op.id);
      }
      target.replaceAll([...items.values()]);
    }
  }

  async function pull(): Promise<boolean> {
    lastPull = Date.now();
    try {
      apply(await remote.pullAll());
      useSyncStatus.setState({ status: Object.keys(pending).length > 0 ? useSyncStatus.getState().status : 'ok' });
      return true;
    } catch {
      useSyncStatus.setState({ status: 'offline' });
      return false;
    }
  }

  function listen<K extends keyof WindowEventMap>(target: Window | Document, type: K | 'visibilitychange', fn: () => void) {
    target.addEventListener(type, fn);
    cleanups.push(() => target.removeEventListener(type, fn));
  }

  async function start(): Promise<{ pulled: boolean }> {
    cleanups.push(onDocChange(enqueue));
    useSyncStatus.setState({ status: 'syncing', pending: Object.keys(pending).length });
    if (typeof window !== 'undefined') {
      listen(window, 'online', () => void flush().then(() => pull()));
      listen(window, 'pagehide', () => void flush({ keepalive: true }));
      listen(document, 'visibilitychange', () => {
        if (document.visibilityState === 'hidden') void flush({ keepalive: true });
        else if (Date.now() - lastPull > 5000) void pull();
      });
    }

    let docs: RemoteDoc[];
    try {
      docs = await remote.pullAll();
      lastPull = Date.now();
    } catch {
      useSyncStatus.setState({ status: 'offline' });
      return { pulled: false };
    }

    if (docs.length === 0) {
      // First sync ever: the server is empty, so this browser's data becomes the starting point.
      const registry = syncedCollections();
      for (const name of names()) {
        for (const item of registry.get(name)?.list() ?? []) {
          pending[`${name}/${item.id}`] = { collection: name, id: item.id, item };
        }
      }
      savePending();
    } else {
      apply(docs);
    }
    useSyncStatus.setState({ status: 'ok' });
    await flush();
    return { pulled: true };
  }

  function stop() {
    cleanups.splice(0).forEach((fn) => fn());
    clearTimeout(pushTimer);
    clearTimeout(retryTimer);
  }

  return { start, stop, pull, flush };
}
