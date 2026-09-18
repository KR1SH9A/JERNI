import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys — Create a new journey.
 * GET /api/journeys/mine is handled by the journeys/mine/route.ts
 */
export async function POST(req: NextRequest) {
  const token = getToken(req);
  console.log('[route.ts] Token being sent to NestJS:', token ? `${token.substring(0, 15)}...` : 'null');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${API_BASE}/journeys`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
