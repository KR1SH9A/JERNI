import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { proxyFetch } from '@/lib/proxy-fetch';

/**
 * POST /api/onboarding/recommendations
 *
 * Proxies to NestJS POST /onboarding/recommendations, forwarding the user's JWT.
 * The JWT is read from the server-side cookie — never from client JS.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await proxyFetch(
    `${apiUrl}/onboarding/recommendations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    },
    'POST /onboarding/recommendations',
  );

  const data = await res.json().catch(() => ({ journeys: [], source: 'popular' }));
  return NextResponse.json(data, { status: res.status });
}
