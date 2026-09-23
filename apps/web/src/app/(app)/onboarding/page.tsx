import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { OnboardingClient } from './client';

export const metadata: Metadata = {
  title: 'Welcome to JERNI — Get Started',
  description: 'Tell us your interests and we\'ll find the perfect journeys for you.',
};

/**
 * /onboarding — Server Component (auth guard + idempotency guard).
 *
 * Two guards run server-side before the client page is rendered:
 *  1. Auth guard: unauthenticated users → /auth/login
 *  2. Idempotency guard: users who already completed onboarding → /dashboard
 *
 * This makes the onboarding page safe to navigate to directly (no flash),
 * survives page refreshes, and won't show twice to existing users.
 */
export default async function OnboardingPage() {
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

  // Guard 1: must be logged in
  if (!user) {
    redirect('/auth/login');
  }

  // Guard 2: already onboarded → skip to dashboard
  if (user.user_metadata?.onboarding_completed === true) {
    redirect('/dashboard');
  }

  // New user — render the onboarding UI
  return <OnboardingClient />;
}
