import type { AppState } from '../types/state';
import { createInitialState, validateState } from './validation';

export const STORAGE_KEY = 'lyra-roadmap:v1';

export interface LoadResult {
  state: AppState;
  /** Set when saved data existed but could not be used. */
  error?: string;
}

export function loadState(): LoadResult {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: createInitialState(), error: 'Browser storage is unavailable. Progress will not be saved.' };
  }
  if (!raw) return { state: createInitialState() };
  try {
    const result = validateState(JSON.parse(raw));
    if (result.ok) return { state: result.state };
    backupCorrupt(raw);
    return { state: createInitialState(), error: 'Saved progress was invalid and has been backed up. Starting fresh.' };
  } catch {
    backupCorrupt(raw);
    return { state: createInitialState(), error: 'Saved progress could not be read and has been backed up. Starting fresh.' };
  }
}

function backupCorrupt(raw: string) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:backup-${Date.now()}`, raw);
  } catch {
    /* ignore */
  }
}

/** Returns false when the write failed (e.g. storage full or blocked). */
export function saveState(state: AppState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function buildExport(state: AppState): string {
  return JSON.stringify({ app: 'lyra-roadmap', exportedAt: new Date().toISOString(), data: state }, null, 2);
}

export function downloadFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
