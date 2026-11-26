import { SYNC_META_KEY } from './config';
import type { SyncBase } from './engine';
import { EMPTY_BASE } from './engine';

interface StoredMeta extends SyncBase {
  userId: string;
  lastSyncedAt: string | null;
}

export interface SyncMeta {
  base: SyncBase;
  lastSyncedAt: string | null;
}

/** Sync bookkeeping lives outside the exported progress so it never travels between devices. */
export function loadMeta(userId: string): SyncMeta {
  try {
    const raw = window.localStorage.getItem(SYNC_META_KEY);
    if (!raw) return { base: EMPTY_BASE, lastSyncedAt: null };
    const meta = JSON.parse(raw) as Partial<StoredMeta>;
    // A different account on this browser is treated as a first link.
    if (meta.userId !== userId || typeof meta.json !== 'string' || typeof meta.revision !== 'number') return { base: EMPTY_BASE, lastSyncedAt: null };
    return { base: { revision: meta.revision, json: meta.json }, lastSyncedAt: typeof meta.lastSyncedAt === 'string' ? meta.lastSyncedAt : null };
  } catch {
    return { base: EMPTY_BASE, lastSyncedAt: null };
  }
}

export function saveMeta(userId: string, base: SyncBase, lastSyncedAt: string | null) {
  try {
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify({ userId, ...base, lastSyncedAt }));
  } catch {
    /* storage full or blocked: the next sync simply re-merges */
  }
}

export function clearMeta() {
  try {
    window.localStorage.removeItem(SYNC_META_KEY);
  } catch {
    /* ignore */
  }
}
