import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys/[id]/archive — Archive a PUBLISHED journey.
 * Proxies to POST /journeys/:id/archive on NestJS.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/archive`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    `POST /journeys/${id}/archive`,
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
