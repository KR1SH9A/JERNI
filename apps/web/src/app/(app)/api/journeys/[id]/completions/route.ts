import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * GET /api/journeys/[id]/completions
 *
 * Proxies to NestJS GET /journeys/:id/progress/me, returning the user's
 * task completion records. Used by the useCompletions hook's queryFn
 * for background re-fetches after mutations.
 *
 * Returns: { completions: CompletionReadModel[] }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ completions: [] });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/progress/me`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
    `GET /journeys/${id}/progress/me`,
  );

  if (!res.ok) return NextResponse.json({ completions: [] });
  const data = await res.json().catch(() => ({ completions: [] }));
  return NextResponse.json(data);
}
