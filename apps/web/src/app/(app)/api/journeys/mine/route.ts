import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * GET /api/journeys/mine — Returns the current user's journeys (all statuses).
 */
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/mine`,
    { headers: { Authorization: `Bearer ${token}` } },
    'GET /journeys/mine',
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
