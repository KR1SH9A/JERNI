import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys/[id]/memberships — Join a journey.
 * Proxies to NestJS with the server-side JWT. JWT never touches the browser.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/memberships`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    `POST /journeys/${id}/memberships`,
  );

  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}

/**
 * DELETE /api/journeys/[id]/memberships — Leave a journey.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/memberships/me`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    `DELETE /journeys/${id}/memberships/me`,
  );

  return new NextResponse(null, { status: res.status });
}
