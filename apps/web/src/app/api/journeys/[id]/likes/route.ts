import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | null> {
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
  return session?.access_token ?? null;
}

/**
 * POST /api/journeys/[id]/likes — Like a journey (idempotent).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_BASE}/journeys/${id}/likes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return new NextResponse(null, { status: res.status });
}

/**
 * DELETE /api/journeys/[id]/likes — Unlike a journey (idempotent).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_BASE}/journeys/${id}/likes`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return new NextResponse(null, { status: res.status });
}
