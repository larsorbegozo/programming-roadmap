/**
 * The sync algorithm, independent of Supabase and of React so it can be tested in isolation.
 *
 * The cloud holds one document per user with a `revision` counter. A device remembers the revision
 * (and the exact JSON) it last synced. Saving is compare-and-swap: it only succeeds if the cloud is
 * still at the revision the device last saw, so one device can never silently overwrite another's work.
 */
import type { AppState } from '../../types/state';
import { validateState } from '../validation';
import { hasProgress, mergeStates } from './merge';

export interface RemoteDoc {
  data: unknown;
  revision: number;
}

export interface RemoteStore {
  fetch(): Promise<RemoteDoc | null>;
  fetchRevision(): Promise<number | null>;
  /**
   * Insert the first document (baseRevision null) or replace the current one.
   * Returns the new revision, or null when another device saved first (a conflict).
   */
  push(data: AppState, baseRevision: number | null): Promise<number | null>;
}

/** What this device last synced. `json` is the exact document, used to detect unsynced changes. */
export interface SyncBase {
  revision: number | null;
  json: string | null;
}

export const EMPTY_BASE: SyncBase = { revision: null, json: null };

export type SyncKind = 'unchanged' | 'pushed' | 'pulled' | 'merged';

export interface SyncResult {
  kind: SyncKind;
  /** Present when this device's state must be replaced by it ('pulled' or 'merged'). */
  state?: AppState;
  base: SyncBase;
}

export class SyncError extends Error {
  constructor(
    message: string,
    readonly code: 'invalid-remote' | 'conflict-loop',
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

const MAX_ATTEMPTS = 4;

export const serialize = (state: AppState): string => JSON.stringify(state);

export function isDirty(local: AppState, base: SyncBase): boolean {
  return base.json === null || serialize(local) !== base.json;
}

export async function syncOnce(local: AppState, base: SyncBase, remote: RemoteStore): Promise<SyncResult> {
  const localJson = serialize(local);
  const dirty = isDirty(local, base);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const doc = await remote.fetch();

    // Nothing in the cloud yet: upload this device's copy.
    if (!doc) {
      const revision = await remote.push(local, null);
      if (revision === null) continue; // someone created it first; look again
      return { kind: 'pushed', base: { revision, json: localJson } };
    }

    const validated = validateState(doc.data);
    if (!validated.ok) throw new SyncError(`The cloud copy is invalid: ${validated.errors[0] ?? 'unknown problem'}`, 'invalid-remote');
    const remoteState = validated.state;
    const remoteJson = serialize(remoteState);

    // The cloud is exactly where this device left it.
    if (base.revision === doc.revision && base.json !== null) {
      if (!dirty) return { kind: 'unchanged', base };
      const revision = await remote.push(local, doc.revision);
      if (revision === null) continue;
      return { kind: 'pushed', base: { revision, json: localJson } };
    }

    // The cloud changed since this device last synced (or this device never synced).
    const firstLink = base.revision === null;
    const adoptRemote = firstLink ? !hasProgress(local) : !dirty;
    if (adoptRemote) return { kind: 'pulled', state: remoteState, base: { revision: doc.revision, json: remoteJson } };

    const merged = mergeStates(local, remoteState, firstLink ? 'remote' : 'local');
    const mergedJson = serialize(merged);
    // This device had nothing the cloud lacked.
    if (mergedJson === remoteJson) return { kind: 'pulled', state: remoteState, base: { revision: doc.revision, json: remoteJson } };

    const revision = await remote.push(merged, doc.revision);
    if (revision === null) continue;
    return { kind: 'merged', state: merged, base: { revision, json: mergedJson } };
  }
  throw new SyncError('Could not sync: another device keeps saving at the same time. Try again in a moment.', 'conflict-loop');
}

/**
 * Applies a sync result to state that may have changed while the request was in flight,
 * without losing the learner's newest edits.
 */
export function reconcileResult(current: AppState, snapshotJson: string, result: SyncResult): AppState | null {
  if (!result.state) return null;
  if (serialize(current) === snapshotJson) return result.state;
  return mergeStates(current, result.state, 'local');
}
