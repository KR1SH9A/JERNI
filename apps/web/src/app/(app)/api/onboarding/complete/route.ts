import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/onboarding/complete
 *
 * Marks the current user's onboarding as complete by setting
 * `user_metadata.onboarding_completed = true` in Supabase auth.
 *
 * This flag is the persistent source of truth for whether a user
 * has been through the Gemini onboarding flow. It is checked in:
 *   - middleware.ts (redirect after login)
 *   - /auth/callback (redirect after email confirmation)
 *   - /onboarding page (idempotency guard)
 *
 * Uses the SUPABASE_SERVICE_ROLE_KEY (server-only) — never exposed to the browser.
 */
export async function POST(_req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();

  // Verify the user is authenticated first
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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use the admin client (service role) to write user_metadata
  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      onboarding_completed: true,
    },
  });

  if (error) {
    console.error('[onboarding/complete] Failed to update user metadata:', error.message);
    return NextResponse.json({ error: 'Failed to mark onboarding complete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
