import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '../../types/state';
import { AUTH_STORAGE_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';
import type { RemoteDoc, RemoteStore } from './engine';

/** The Supabase library is loaded on demand, so visitors who never sign in don't download it. */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getClient(): Promise<SupabaseClient> {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        // A magic link opened in the same browser signs in through ?code=…; the app itself uses #/ routes.
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }),
  );
  return clientPromise;
}

export type CloudErrorKind = 'offline' | 'needs-setup' | 'auth' | 'other';

export class CloudError extends Error {
  constructor(
    message: string,
    readonly kind: CloudErrorKind,
  ) {
    super(message);
    this.name = 'CloudError';
  }
}

interface PostgrestLike {
  message?: string;
  code?: string;
  status?: number;
}

/** Turns whatever Supabase or the network threw into something the UI can explain. */
export function toCloudError(err: unknown): CloudError {
  if (err instanceof CloudError) return err;
  const e = (err ?? {}) as PostgrestLike;
  const message = e.message ?? String(err);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return new CloudError('You are offline.', 'offline');
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) return new CloudError('Cannot reach the cloud right now.', 'offline');
  if (e.code === 'PGRST205' || e.code === '42P01' || /schema cache|does not exist/i.test(message))
    return new CloudError('The cloud table is not set up yet. Run supabase/schema.sql in the Supabase SQL Editor.', 'needs-setup');
  if (e.status === 401 || e.status === 403 || e.code === 'PGRST301' || /jwt|not authenticated|invalid claim/i.test(message))
    return new CloudError('Your sign-in expired. Please sign in again.', 'auth');
  return new CloudError(message, 'other');
}

/** The user's single progress row. Row Level Security makes it unreachable for anyone else. */
export class SupabaseRemote implements RemoteStore {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async fetch(): Promise<RemoteDoc | null> {
    const { data, error } = await this.client.from('progress').select('data, revision').eq('user_id', this.userId).maybeSingle();
    if (error) throw toCloudError(error);
    return data ? { data: data.data, revision: Number(data.revision) } : null;
  }

  async fetchRevision(): Promise<number | null> {
    const { data, error } = await this.client.from('progress').select('revision').eq('user_id', this.userId).maybeSingle();
    if (error) throw toCloudError(error);
    return data ? Number(data.revision) : null;
  }

  async push(state: AppState, baseRevision: number | null): Promise<number | null> {
    if (baseRevision === null) {
      const { data, error } = await this.client.from('progress').insert({ user_id: this.userId, data: state, revision: 1 }).select('revision').single();
      // 23505 = unique violation: another device created the row first.
      if (error?.code === '23505') return null;
      if (error) throw toCloudError(error);
      return Number(data.revision);
    }
    const { data, error } = await this.client
      .from('progress')
      .update({ data: state, revision: baseRevision + 1 })
      .eq('user_id', this.userId)
      .eq('revision', baseRevision)
      .select('revision');
    if (error) throw toCloudError(error);
    return data && data.length > 0 ? Number((data[0] as { revision: number }).revision) : null;
  }
}

// ---------- Authentication (email one-time code) ----------

export async function sendLoginCode(email: string): Promise<void> {
  const client = await getClient();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
  });
  if (error) throw toCloudError(error);
}

export async function verifyLoginCode(email: string, code: string): Promise<void> {
  const client = await getClient();
  const { error } = await client.auth.verifyOtp({ email, token: code, type: 'email' });
  if (error) throw toCloudError(error);
}

export async function signOutOfCloud(): Promise<void> {
  const client = await getClient();
  const { error } = await client.auth.signOut();
  if (error) throw toCloudError(error);
}
