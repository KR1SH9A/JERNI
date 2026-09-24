import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /auth/signout — Server Action route handler.
 * Called by the sign-out form in Nav. Clears the Supabase session cookie
 * and redirects back to the home page.
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = req.nextUrl.clone();
  url.pathname = '/';
  url.search = '';

  return NextResponse.redirect(url, {
    status: 303,
  });
}
