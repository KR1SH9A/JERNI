import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NavClient } from './nav-client';

/**
 * Nav — Server Component (renders the PillNav via NavClient).
 * Reads session server-side so the JWT never reaches client JS.
 */
export async function Nav() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      {/* Spacer for the fixed floating nav if needed, or simply render NavClient */}
      <NavClient isLoggedIn={!!user} />
    </>
  );
}
