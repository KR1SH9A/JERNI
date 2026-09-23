import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 *
 * Handles the Supabase PKCE email-confirmation redirect.
 *
 * When a user signs up and Supabase email confirmation is enabled, Supabase
 * redirects to this URL with a `code` query parameter. This handler:
 *   1. Exchanges the `code` for a real session (PKCE flow).
 *   2. Reads the user's `onboarding_completed` flag from user_metadata.
 *   3. Redirects new users → /onboarding, returning users → /dashboard.
 *
 * Without this handler, the `code` expires unused and the user is never
 * logged in after clicking the confirmation email.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    // No code — redirect to login with an error hint
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] Code exchange failed:', error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
  }

  // Check if the user has already completed onboarding
  const hasOnboarded = data.user.user_metadata?.onboarding_completed === true;

  if (!hasOnboarded) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
