import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * createSupabaseServerClient — creates a Supabase client for Server Components / Route Handlers.
 *
 * Uses httpOnly cookies (via @supabase/ssr) — the JWT never touches client-side JS.
 * This is the ONLY way Supabase auth is accessed server-side.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — cookie setting ignored (handled by middleware)
          }
        },
      },
    },
  );
}
