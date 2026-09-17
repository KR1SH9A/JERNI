import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /auth/signout — Server Action route handler.
 * Called by the sign-out form in Nav. Clears the Supabase session cookie
 * and redirects back to the home page.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), {
    status: 303,
  });
}
