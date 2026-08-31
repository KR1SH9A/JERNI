'use client';
import { createBrowserClient } from '@supabase/ssr';

/**
 * createSupabaseBrowserClient — Supabase client for Client Components.
 *
 * Used ONLY for auth UI (sign in / sign out). The anon key is public by design
 * (Supabase rate-limits it). This client NEVER reads app data — all data reads
 * go through the NestJS API, not Supabase directly.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
