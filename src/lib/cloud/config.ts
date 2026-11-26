/**
 * Supabase project settings. Both values are public by design: the publishable key is embedded in
 * every client, and Row Level Security (see supabase/schema.sql) is what protects the data.
 * Never put the service_role / secret key here.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://kvdcprdwcyhfjioqwbdd.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? 'sb_publishable_Ab-VEhs_cQclHKowi4J7HA_8DornhL3';

/** Where the Supabase session is stored; checked first so signed-out visitors never load the library. */
export const AUTH_STORAGE_KEY = 'lyra-roadmap:auth';
export const SYNC_META_KEY = 'lyra-roadmap:sync';

export const isCloudConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');

/** The project's short id (the first part of its URL), shown in the UI so it can be compared with the dashboard. */
export const SUPABASE_PROJECT_REF = (() => {
  try {
    return new URL(SUPABASE_URL).hostname.split('.')[0] ?? '';
  } catch {
    return '';
  }
})();
