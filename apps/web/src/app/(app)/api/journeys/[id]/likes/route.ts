import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * GET /api/journeys/[id]/likes — Check like status + count.
 * Returns { isLiked: boolean, likeCount: number } for useLike hook re-fetches.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);

  // Fetch journey for likeCount + optionally user's like status
  const [journeyRes, likeRes] = await Promise.allSettled([
    proxyFetch(`${API_BASE}/journeys/${id}`, { method: 'GET' }, `GET /journeys/${id}`),
    token
      ? proxyFetch(
          `${API_BASE}/journeys/${id}/likes/me`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          `GET /journeys/${id}/likes/me`,
        )
      : Promise.resolve(null),
  ]);

  let likeCount = 0;
  let isLiked = false;

  if (journeyRes.status === 'fulfilled' && journeyRes.value?.ok) {
    const j = await journeyRes.value.json().catch(() => ({}));
    likeCount = j.likeCount ?? 0;
  }
  if (likeRes.status === 'fulfilled' && likeRes.value && (likeRes.value as Response).ok) {
    const l = await (likeRes.value as Response).json().catch(() => ({}));
    isLiked = l.isLiked ?? false;
  }

  return NextResponse.json({ isLiked, likeCount });
}

/**
 * POST /api/journeys/[id]/likes — Like a journey (idempotent).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/likes`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
    `POST /journeys/${id}/likes`,
  );

  return new NextResponse(null, { status: res.status });
}

/**
 * DELETE /api/journeys/[id]/likes — Unlike a journey (idempotent).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/likes`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    `DELETE /journeys/${id}/likes`,
  );

  return new NextResponse(null, { status: res.status });
}
