import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AUTH_STORAGE_KEY, isCloudConfigured } from '../lib/cloud/config';
import { EMPTY_BASE, SyncError, isDirty, reconcileResult, serialize, syncOnce, type SyncBase } from '../lib/cloud/engine';
import { hasProgress } from '../lib/cloud/merge';
import { clearMeta, loadMeta, saveMeta } from '../lib/cloud/meta';
import { SupabaseRemote, getClient, sendLoginCode, signOutOfCloud, toCloudError, verifyLoginCode } from '../lib/cloud/supabase';
import { STORAGE_KEY } from '../lib/storage';
import { useAppState } from './useAppState';

export type CloudStatus = 'disabled' | 'signed-out' | 'checking' | 'synced' | 'syncing' | 'offline' | 'needs-setup' | 'error';

interface CloudSyncValue {
  status: CloudStatus;
  email: string | null;
  lastSyncedAt: string | null;
  error: string | null;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncValue | null>(null);

const PUSH_DELAY_MS = 2000;
const POLL_MS = 45_000;
const BACKUP_KEY = `${STORAGE_KEY}:before-sync-backup`;

function hasStoredSession(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return window.localStorage.getItem(AUTH_STORAGE_KEY) !== null || params.has('code') || params.has('error_description');
  } catch {
    return false;
  }
}

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useAppState();
  // Visitors who never signed in never download the Supabase library.
  const [clientNeeded, setClientNeeded] = useState(() => isCloudConfigured && hasStoredSession());
  const [status, setStatus] = useState<CloudStatus>(!isCloudConfigured ? 'disabled' : clientNeeded ? 'checking' : 'signed-out');
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const baseRef = useRef<SyncBase>(EMPTY_BASE);
  const userRef = useRef<{ id: string } | null>(null);
  const running = useRef(false);
  const rerun = useRef(false);

  // ---- Session: restore it, and follow sign-in / sign-out ----
  useEffect(() => {
    if (!isCloudConfigured || !clientNeeded) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const apply = (u: { id: string; email?: string } | null) => {
      userRef.current = u ? { id: u.id } : null;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
      if (!u) {
        baseRef.current = EMPTY_BASE;
        setStatus('signed-out');
      }
    };

    void getClient()
      .then(async (client) => {
        const { data } = await client.auth.getSession();
        if (cancelled) return;
        apply(data.session?.user ?? null);
        // Keep this callback synchronous: it only updates React state.
        const sub = client.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT') apply(null);
          else if (session?.user && userRef.current?.id !== session.user.id) apply(session.user);
        });
        unsubscribe = () => sub.data.subscription.unsubscribe();
      })
      .catch((err) => {
        if (cancelled) return;
        const e = toCloudError(err);
        setError(e.message);
        setStatus(e.kind === 'offline' ? 'offline' : 'error');
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [clientNeeded]);

  // ---- One sync pass ----
  const runSync = useCallback(async (light: boolean) => {
    const current = userRef.current;
    if (!current) return;
    if (running.current) {
      rerun.current = true;
      return;
    }
    // The browser already knows it has no network (airplane mode): don't wait for the request to time out.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('offline');
      setError(null);
      return;
    }
    running.current = true;
    try {
      const client = await getClient();
      const remote = new SupabaseRemote(client, current.id);

      if (light && baseRef.current.revision !== null && !isDirty(stateRef.current, baseRef.current)) {
        const revision = await remote.fetchRevision();
        if (revision === baseRef.current.revision) {
          setStatus('synced');
          setError(null);
          return;
        }
      } else if (!light || isDirty(stateRef.current, baseRef.current)) {
        setStatus('syncing');
      }

      const snapshot = serialize(stateRef.current);
      const result = await syncOnce(stateRef.current, baseRef.current, remote);
      const next = reconcileResult(stateRef.current, snapshot, result);
      if (next) {
        // Keep what was on this device, in case the merge ever surprises the learner.
        if (hasProgress(stateRef.current)) {
          try {
            window.localStorage.setItem(BACKUP_KEY, snapshot);
          } catch {
            /* ignore */
          }
        }
        dispatch({ type: 'replaceState', state: next });
      }
      baseRef.current = result.base;
      const now = new Date().toISOString();
      saveMeta(current.id, result.base, now);
      setLastSyncedAt(now);
      setError(null);
      setStatus('synced');
    } catch (err) {
      const e = err instanceof SyncError ? { message: err.message, kind: 'other' as const } : toCloudError(err);
      setError(e.message);
      setStatus(e.kind === 'offline' ? 'offline' : e.kind === 'needs-setup' ? 'needs-setup' : 'error');
    } finally {
      running.current = false;
      if (rerun.current) {
        rerun.current = false;
        void runSync(false);
      }
    }
  }, [dispatch]);

  // ---- First sync after sign-in ----
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    const meta = loadMeta(userId);
    baseRef.current = meta.base;
    setLastSyncedAt(meta.lastSyncedAt);
    void runSync(false);
  }, [userId, runSync]);

  // ---- Push local changes shortly after they happen ----
  useEffect(() => {
    if (!userId || status === 'needs-setup') return;
    if (!isDirty(state, baseRef.current)) return;
    const timer = window.setTimeout(() => void runSync(false), PUSH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, userId, status, runSync]);

  // ---- Pick up the other device's changes ----
  useEffect(() => {
    if (!userId) return;
    const onVisible = () => void runSync(document.visibilityState === 'visible');
    const poll = window.setInterval(() => document.visibilityState === 'visible' && void runSync(true), POLL_MS);
    const onOnline = () => void runSync(false);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [userId, runSync]);

  const sendCode = useCallback(async (email: string) => {
    await sendLoginCode(email.trim());
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    await verifyLoginCode(email.trim(), code.trim());
    // The session is stored now; start following it, which triggers the first sync.
    setStatus('checking');
    setClientNeeded(true);
  }, []);

  const signOut = useCallback(async () => {
    await signOutOfCloud();
    clearMeta();
    baseRef.current = EMPTY_BASE;
    userRef.current = null;
    setUser(null);
    setLastSyncedAt(null);
    setError(null);
    setStatus('signed-out');
  }, []);

  const syncNow = useCallback(() => runSync(false), [runSync]);

  const value = useMemo<CloudSyncValue>(
    () => ({ status, email: user?.email ?? null, lastSyncedAt, error, sendCode, verifyCode, signOut, syncNow }),
    [status, user, lastSyncedAt, error, sendCode, verifyCode, signOut, syncNow],
  );
  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSync(): CloudSyncValue {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloudSync must be used inside CloudSyncProvider');
  return ctx;
}
