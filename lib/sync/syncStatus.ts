import { create } from 'zustand';

export type SyncState = 'idle' | 'syncing' | 'ok' | 'offline';

interface SyncStatus {
  status: SyncState;
  pending: number; // local changes not yet on the server
}

export const useSyncStatus = create<SyncStatus>(() => ({ status: 'idle', pending: 0 }));
